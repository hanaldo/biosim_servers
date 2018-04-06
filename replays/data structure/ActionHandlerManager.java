package shenshen.han.biosim.game;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TimerTask;
import shenshen.han.biosim.models.Action;
import shenshen.han.biosim.models.Actor;
import shenshen.han.biosim.models.GameActionTypes;
import shenshen.han.biosim.models.GameActorTypes;
import shenshen.han.biosim.models.PathGroup;
import shenshen.han.biosim.models.PathPoint;
import shenshen.han.biosim.models.PathUpdatePack;
import shenshen.han.biosim.serial.DeviceProtocol;
import shenshen.han.biosim.utils.MyGson;
import static shenshen.han.biosim.utils.StringNullTry.tryPutStringInArray;
import shenshen.han.biosim.utils.UtilLog;
import shenshen.han.biosim.websockets.EndpointActorStatus;
import shenshen.han.biosim.websockets.EndpointBiosimGame;
import shenshen.han.biosim.xbee.MessageToDevice2;

public class ActionHandlerManager implements GameActorTypes, GameActionTypes, DeviceProtocol {

    private Map<String, InterfaceActionHandler> actionHandlers;
    public Map<String, CarryGroup> pickupGroups = new HashMap<>(5);
    public List<CarryGroup> conveyGroups = new LinkedList<>();

    public ActionHandlerManager() {
        actionHandlers = new HashMap<>(5);

        actionHandlers.put(Action_Bee_Out, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                Actor bee = Game.Game_Control.getActorById(action.actor);
                Actor hiveExit = Game.Game_Control.getActorById(action.reactor);

                if (!bee.dyProps.isInHive()) {
                    tryPutStringInArray("Bee is already outside", error);
                } else {
                    if (hiveExit.dyProps.isHasExit() && hiveExit.id - 1 != bee.dyProps.getPositionId()) {
                        tryPutStringInArray("Wrong exit", error);
                        return false;
                    }
                    if (!hiveExit.dyProps.isHasExit() && hiveExit.id.intValue() != bee.dyProps.getPositionId()) {
                        tryPutStringInArray("Wrong exit", error);
                        return false;
                    }
                    Game.Hive_View.beeOut(bee.name);
                }

                bee.dyProps.setInHive(false);
                bee.dyProps.setPositionId(null);
                action.objectsCopy.add(cloneActorWithoutPosition(bee));
                bee.tellBeeOut(bee.getEnergyLevel());

                EndpointActorStatus.broadcast(bee);
                return true;
            }
        });

        actionHandlers.put(Action_Touch, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                Actor actor = Game.Game_Control.getActorById(action.actor);
                Actor reactor = Game.Game_Control.getActorById(action.reactor);
                if (actor.space != reactor.space.intValue()) {
                    tryPutStringInArray("Actors from different space", error);
                    return false;
                }
                switch (actor.type + reactor.type) {
                    case Actor_Bee + Actor_Flower:
                    case Actor_Ant + Actor_Flower:
                        if (actor.dyProps.getCurrentEnergy() <= 0) {
                            tryPutStringInArray("Bee has no energy", error);
                            actor.pushBeeState(0, -1, -1);
                            return false;
                        }

                        if (actor.dyProps.isInHive()) {
                            actor.dyProps.setInHive(false);
                            actor.dyProps.setPositionId(null);
                            Game.Hive_View.beeOut(actor.name);
                            tryPutStringInArray("Auto check-out for bee", error);
                        }

                        if (reactor.dyProps.getFoodPieceSize() > 1) {//ignore size 1
                            loadLargeFood(actor, reactor, error);
                        } else {
                            loadSmallFood(actor, reactor, error);
                        }

                        action.objectsCopy.add(cloneActorWithoutPosition(actor));
                        action.objectsCopy.add(MyGson.cloneObject(reactor, Actor.class));

                        EndpointActorStatus.broadcast(actor);
                        return true;

                    case Actor_Bee + Actor_Hive:
                    case Actor_Ant + Actor_Hive:
                        if (actor.dyProps.getCurrentEnergy() <= 0) {
                            tryPutStringInArray("Bee has no energy", error);
                            actor.pushBeeState(0, -1, -1);
                            return false;
                        }
                        if (actor.dyProps.getCurrentNectar() < 0) {
                            tryPutStringInArray("Bee has negative nectar", error);
                            return false;
                        }
                        removeFromPickupGroup(actor.id, true);

                        reactor.dyProps.addNectar(actor.dyProps.getCurrentNectar());
                        actor.dyProps.setCurrentNectar(0);
                        actor.dyProps.addEnergy(-actor.dyProps.getEnergyLoss() / 2);
                        actor.dyProps.setCurrentEnergy(actor.dyProps.getMaxEnergy());//immediate
                        boolean wasOutside = !actor.dyProps.isInHive();
                        actor.dyProps.setInHive(true);
                        actor.dyProps.setPositionId(reactor.id);
                        actor.checkRevive();
                        actor.pushBeeState(
                                actor.getEnergyLevel(),
                                actor.dyProps.getCurrentNectar(),
                                -1);

                        action.objectsCopy.add(cloneActorWithoutPosition(actor));
                        action.objectsCopy.add(MyGson.cloneObject(reactor, Actor.class));

                        leaveConveyGroup(actor.id);

                        Game.Hive_View.setHiveNectarInfo(reactor.id, reactor.dyProps.getCurrentNectar(), reactor.dyProps.getMaxNectar());
                        if (wasOutside) {
                            Game.Hive_View.beeEnterHive(actor.name);
                        }

                        EndpointActorStatus.broadcast(actor);
                        return true;

                    default:
                        String e = "Invalid action [touch]: " + actor.type + reactor.type;
                        UtilLog.logInfo(this, e);
                        tryPutStringInArray(e, error);
                        return false;
                }
            }
        });

        actionHandlers.put(Action_Change_Setting, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                Actor reactor = Game.Game_Control.getActorById(action.reactor);
                Actor temp = (Actor) action.temp;

                if (reactor.type.equals(Actor_Flower)) {
                    //do not change semi-fixed properties
                    temp.dyProps.setFakeX(reactor.dyProps.getFakeX());
                    temp.dyProps.setFakeY(reactor.dyProps.getFakeY());
                    temp.dyProps.setPathGroup(reactor.dyProps.getPathGroup());
                    temp.dyProps.setFoodPieceSize(reactor.dyProps.getFoodPieceSize());
                    temp.dyProps.setNumberOfCarrier(reactor.dyProps.getNumberOfCarrier());
                    UtilLog.logInfo(this, "Change:\n" + MyGson.toJson(reactor.dyProps) + "\nto:\n" + MyGson.toJson(temp.dyProps));
                    reactor.dyProps = temp.dyProps;
                    action.temp = null;

                    action.objectsCopy.add(MyGson.cloneObject(reactor, Actor.class));
                    Game.Game_Control.updateGroupSetting(reactor.id, temp.dyProps);
                    return true;
                }
                if (reactor.type.equals(Actor_Hive)) {
                    //do not change semi-fixed properties
                    temp.dyProps.setFakeX(reactor.dyProps.getFakeX());
                    temp.dyProps.setFakeY(reactor.dyProps.getFakeY());
                    temp.dyProps.setHasExit(reactor.dyProps.isHasExit());
                    temp.dyProps.setNectarLoss(reactor.dyProps.getNectarLoss());
                    UtilLog.logInfo(this, "Change:\n" + MyGson.toJson(reactor.dyProps) + "\nto:\n" + MyGson.toJson(temp.dyProps));
                    reactor.dyProps = temp.dyProps;
                    action.temp = null;

                    action.objectsCopy.add(MyGson.cloneObject(reactor, Actor.class));
                    Game.Hive_View.setHiveNectarInfo(reactor.id, reactor.dyProps.getCurrentNectar(), reactor.dyProps.getMaxNectar());

                    Game.Game_Control.updateGroupSetting(reactor.id, temp.dyProps);
                    return true;
                }
                tryPutStringInArray("Can only config Hive or Flower", error);
                return false;
            }
        });

        actionHandlers.put(Action_Reduce_Energy, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                for (Actor actor : Game.Game_Control.getAllActors()) {
                    if (actor.type.equals(Actor_Bee) || actor.type.equals(Actor_Ant)) {
                        if (actor.dyProps.getCurrentEnergy() > 0 && !actor.dyProps.isInHive()
                                && actor.dyProps.getEnergyLoss() != 0) {

                            int max = actor.dyProps.getMaxEnergy();
                            int before = Actor.getEnergyLevel(actor.dyProps.getCurrentEnergy(), max);

                            actor.dyProps.addEnergy(-actor.dyProps.getEnergyLoss());
                            actor.checkRevive();
                            action.objectsCopy.add(cloneActorWithoutPosition(actor));

                            int now = Actor.getEnergyLevel(actor.dyProps.getCurrentEnergy(), max);
                            if (before != now) {
                                actor.pushBeeState(now, -1, -1);
                            }

                            EndpointActorStatus.broadcast(actor);
                        }
                    }
                }
                return !action.objectsCopy.isEmpty();
            }
        });

        actionHandlers.put(Action_Add_Energy, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                for (Actor actor : Game.Game_Control.getAllActors()) {
                    if (actor.type.equals(Actor_Bee) || actor.type.equals(Actor_Ant)) {
                        if (actor.dyProps.getCurrentEnergy() < actor.dyProps.getMaxEnergy()
                                && actor.dyProps.isInHive()
                                && actor.dyProps.getCurrentEnergy() > 0) {

                            int max = actor.dyProps.getMaxEnergy();
                            int before = Actor.getEnergyLevel(actor.dyProps.getCurrentEnergy(), max);

                            actor.dyProps.addEnergy(actor.dyProps.getEnergyLoss() * 2);
                            action.objectsCopy.add(cloneActorWithoutPosition(actor));

                            int now = Actor.getEnergyLevel(actor.dyProps.getCurrentEnergy(), max);
                            if (before != now) {
                                actor.pushBeeState(now, -1, -1);
                            }

                            EndpointActorStatus.broadcast(actor);
                        }
                    }
                }
                return !action.objectsCopy.isEmpty();
            }
        });

        actionHandlers.put(Action_Make_Rain, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                if (Game.Game_Control.getWorld().weather.equals(action.type)) {
                    return false;
                }

                Game.Game_Control.startTimer(GameLogicControl.Nectar_Timer, new TimerTask() {

                    @Override
                    public void run() {
                        String action = Game.Game_Control.buildAndProcessAction(Background_Actor_Reduce_Nectar, Background_Actor_Reduce_Nectar, null, null, null);
                        if (action != null) {
                            EndpointBiosimGame.broadcast(action);
                        }
                    }
                }, 2000, 13000);

                Game.Game_Control.getWorld().weather = action.type;

                return true;
            }
        });

        actionHandlers.put(Action_Make_Snow, actionHandlers.get(Action_Make_Rain));

        actionHandlers.put(Action_Make_Sun, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                if (Game.Game_Control.getWorld().weather.equals(action.type)) {
                    return false;
                }

                Game.Game_Control.cleanTimer(GameLogicControl.Nectar_Timer);

                Game.Game_Control.getWorld().weather = action.type;
                return true;
            }
        });

        actionHandlers.put(Action_Reduce_Nectar, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                for (Actor actor : Game.Game_Control.getAllActors()) {
                    if (actor.type.equals(Actor_Hive)) {
                        if (actor.dyProps.getCurrentNectar() > 0) {
                            actor.dyProps.addNectar(-actor.dyProps.getNectarLoss());
                            action.objectsCopy.add(MyGson.cloneObject(actor, Actor.class));

                            Game.Hive_View.setHiveNectarInfo(actor.id, actor.dyProps.getCurrentNectar(), actor.dyProps.getMaxNectar());
                        }
                    }
                }

                return !action.objectsCopy.isEmpty();
            }
        });

        actionHandlers.put(Action_Revive_Bee, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                Actor bee = Game.Game_Control.getActorById(action.actor);

                if (bee.dyProps.getCurrentEnergy() > 0) {
                    tryPutStringInArray("Bee is still alive", error);
                    return false;
                }

                bee.dyProps.setCurrentEnergy(bee.dyProps.getMaxEnergy());
                action.objectsCopy.add(MyGson.cloneObject(bee, Actor.class));
                bee.pushBeeState(bee.getEnergyLevel(), -1, -1);
                Game.Hive_View.beeRevive(bee.name, bee.dyProps.isInHive());

                EndpointActorStatus.broadcast(bee);
                return true;
            }
        });

        actionHandlers.put(Action_Check_Track, new InterfaceActionHandler() {

            @Override
            public boolean processAction(Action action, String[] error) {
                try {
                    for (Actor actor : Game.Game_Control.getAllActors()) {
                        if (actor.type.equals(Actor_Ant)) {
                            if (!actor.dyProps.getPathGroup().isMoved()) {
                                continue;
                            }
                            if (actor.dyProps.isInHive()) {
                                continue;
                            }
                            if (actor.dyProps.getCurrentEnergy() <= 0) {
                                continue;
                            }
                            boolean inPickup = false;
                            for (CarryGroup g : pickupGroups.values()) {
                                for (int actorId : g.actors) {
                                    if (actorId == actor.id) {
                                        inPickup = true;
                                        break;
                                    }
                                }
                                if (inPickup) {
                                    break;
                                }
                            }
                            if (inPickup) {
                                continue;
                            }
                            try {
                                PathPoint[] best = new PathPoint[1];
                                double[] bestScore = new double[]{0};
                                TrailManager.computeBestPoint(Game.Game_Control.getAllActors(), actor, best, bestScore, Game.Game_Control.getGameWorldTimeNow());
//                                System.out.println(String.format("best to %s: %s", actor.id, MyGson.toJson(best[0])));
//                                System.out.println("score: " + bestScore[0]);
                                if (best[0] != null) {
                                    actor.dyProps.setBestX(best[0].x);
                                    actor.dyProps.setBestY(best[0].y);

                                    PathPoint now = actor.dyProps.getPathGroup().getCurrentPoint();
                                    double targetDirection = Math.toDegrees(Math.atan2(best[0].x - now.x, -(best[0].y - now.y)));
                                    if (targetDirection < 0) {
                                        targetDirection += 360;
                                    }
                                    //System.out.println("actor " + actor.id + " see dot at: " + targetDirection);
                                    Game.Device_Manager.writeToClient(actor.id, new MessageToDevice2()
                                            .setActionType(SET_TARGET)
                                            .setActionResults(new int[]{(int) targetDirection, actor.dyProps.getVelocityHeading().intValue()})
                                            .toString());
                                } else {
                                    actor.dyProps.setBestX(-1);
                                    actor.dyProps.setBestY(-1);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                            action.objectsCopy.add(MyGson.cloneObject(new PathUpdatePack(actor), PathUpdatePack.class));
                            actor.dyProps.getPathGroup().setMoved(false);
                        }
                    }
                    if (action.objectsCopy.isEmpty()) {
                        return false;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    return false;
                }
                return true;
            }
        });
    }

    public InterfaceActionHandler getActionHandler(String actionType) {
        return actionHandlers.get(actionType);
    }

    private void loadSmallFood(Actor actor, Actor reactor, String[] error) {
        if (reactor.dyProps.getCurrentNectar() <= 0) {
            tryPutStringInArray("Flower has no nectar", error);
        } else if (actor.dyProps.getCurrentNectar() >= actor.dyProps.getMaxNectar()) {
            tryPutStringInArray("Actor is full", error);
        } else {
            reactor.dyProps.addNectar(-1);
            actor.dyProps.addNectar(1);
        }
        actor.dyProps.addEnergy(-actor.dyProps.getEnergyLoss() / 2);
        actor.dyProps.setPositionId(reactor.id);
        UtilLog.logInfo(this, actor.type + "-" + actor.id + " loads nectar");
        actor.checkRevive();

        actor.pushBeeState(
                actor.getEnergyLevel(),
                actor.dyProps.getCurrentNectar(),
                reactor.getNectarLevel());
    }

    private void loadLargeFood(Actor actor, Actor reactor, String[] error) {
        int pieceSize = reactor.dyProps.getFoodPieceSize();
        int total = reactor.dyProps.getNumberOfCarrier();

        if (reactor.dyProps.getCurrentNectar() < pieceSize * total) {
            tryPutStringInArray("Food has no content", error);
        } else if (actor.dyProps.getCurrentNectar() > 0) {
            tryPutStringInArray("Actor needs to be empty", error);
        } else {
            removeFromPickupGroup(actor.id, false);

            CarryGroup g;
            if (pickupGroups.containsKey(reactor.id.toString())) {
                g = pickupGroups.get(reactor.id.toString());
            } else {
                g = new CarryGroup();
                g.total = total;
                pickupGroups.put(reactor.id.toString(), g);
            }
            g.actors.add(actor.id);

            if (g.actors.size() == total) {
                g.secondsLeft = TrailManager.groupFoodSeconds;
                for (int actorId : g.actors) {
                    Actor a = Game.Game_Control.getActorById(actorId);
                    a.dyProps.addNectar(pieceSize);
                    reactor.dyProps.addNectar(-pieceSize);
                    a.checkRevive();
                    a.pushBeeState(
                            a.getEnergyLevel(),
                            a.dyProps.getCurrentNectar(),
                            -1);
                    UtilLog.logInfo(this, a.type + "-" + a.id + " loads food portion");
                }
                conveyGroups.add(pickupGroups.remove(reactor.id.toString()));
            } else {
                for (int actorId : g.actors) {
                    Game.Game_Control.getActorById(actorId)
                            .holdForFood(g.actors.size(), total, TrailManager.groupFoodInch);
                }
            }
        }

        actor.dyProps.addEnergy(-actor.dyProps.getEnergyLoss() / 2);
        actor.dyProps.setPositionId(reactor.id);
        actor.pushBeeState(
                actor.getEnergyLevel(),
                actor.dyProps.getCurrentNectar(),
                reactor.getNectarLevel());
    }

    public void leaveConveyGroup(int actorId) {
        for (CarryGroup g : conveyGroups) {
            if (g.actors.remove(actorId)) {
                if (g.actors.isEmpty()) {
                    conveyGroups.remove(g);
                    UtilLog.logInfo(this, "convey group done!");
                }
            }
        }
    }

    public void removeFromPickupGroup(int actorId, boolean notify) {
        UtilLog.logInfo(this, "removeFromPickupGroup()");
        for (CarryGroup g : pickupGroups.values()) {
            boolean removed = g.actors.remove(actorId);
            if (removed && notify) {
                for (int otherActor : g.actors) {
                    Game.Game_Control.getActorById(otherActor)
                            .holdForFood(g.actors.size(), g.total, 15);
                }
            }
        }
    }

    private Actor cloneActorWithoutPosition(Actor actor) {
        PathGroup path = actor.dyProps.getPathGroup();
        actor.dyProps.setPathGroup(null);
        Actor copy = (Actor) MyGson.cloneObject(actor, Actor.class);
        actor.dyProps.setPathGroup(path);
        return copy;
    }

}
