package shenshen.han.biosim.models;

import java.util.LinkedList;
import java.util.List;
import shenshen.han.biosim.game.Game;
import shenshen.han.biosim.game.TrailManager;

/**
 * The class for storing all PathPoint data of one game actor, and the core
 * logics about updating path/trail are kept here.
 *
 * @author shenshenhan
 */
public class PathGroup {

    private final List<PathPoint> points;
    private transient boolean moved = false;

    public PathGroup() {
        this.points = new LinkedList<>();
    }

    public boolean isMoved() {
        return moved;
    }

    public void setMoved(boolean moved) {
        this.moved = moved;
    }

    public synchronized void addPoint(PathPoint p) {
        points.add(p);
    }

    private void removeOldPath(long now) {
        if (points.isEmpty()) {
            return;
        }
        List<PathPoint> remove = new LinkedList<>();
        for (PathPoint p : points) {
            if (p.marker) {
                if (now - p.born > p.life) {
                    p.marker = false;//The dot is dead, so it will not be a marker anymore
                    remove.add(p);
                }
            } else {
                remove.add(p);//always remove non-marker
            }
        }
        if (remove.isEmpty()) {
            return;
        }
        points.removeAll(remove);
    }

    public synchronized void addStaticPoint(int gameX, int gameY) {
        points.clear();
        points.add(new PathPoint(gameX, gameY));

        TrailManager.foodPositions.clear();
        for (Actor actor : Game.Game_Control.getAllActors()) {
            if (actor.type.equals(GameActorTypes.Actor_Flower)) {
                List<PathPoint> path = actor.dyProps.getPathGroup().points;
                if (!path.isEmpty()) {
                    String pid = path.get(0).getPositionId();
                    TrailManager.foodPositions.put(pid, actor.id);
                }
            }
        }
    }

    public synchronized void addNewPath(int x, int y, long now, int width, int height, boolean[] checkOnTrack) {
        int betterX, betterY;
        if (x < 0) {
            betterX = 0;
        } else if (x > width) {
            betterX = width;
        } else {
            betterX = x;
        }
        if (y < 0) {
            betterY = 0;
        } else if (y > height) {
            betterY = height;
        } else {
            betterY = y;
        }

//        UtilLog.logInfo(this, String.format("new path point: %s %s, space: %s %s",
//                betterX, betterY, width, height));
        moved = true;
        if (!points.isEmpty()) {
            PathPoint last = points.get(points.size() - 1);
            if (last.x == betterX && last.y == betterY) {
                moved = false;
            }
        }
        removeOldPath(now);//remove all old and dead dots first

        String id = betterX + "=" + betterY;
        if (TrailManager.allPositions.containsKey(id)) {
            PathPoint p = TrailManager.allPositions.get(id);
            removeSamePoint(betterX, betterY);
            points.add(p);
            if (checkOnTrack != null) {
                if (p.marker) {
                    checkOnTrack[0] = true;
                }
            }
        } else {
            PathPoint p = new PathPoint(betterX, betterY);
            removeSamePoint(betterX, betterY);
            points.add(p);
            TrailManager.allPositions.put(id, p);
        }
    }

    private void removeSamePoint(int x, int y) {
        List<PathPoint> toBeRemoved = new LinkedList<>();
        for (PathPoint p : points) {
            if (p.x == x && p.y == y) {
                toBeRemoved.add(p);
            }
        }
        points.removeAll(toBeRemoved);
    }

    /**
     * Get the current position of the game actor (Ant).
     *
     * @return a PathPoint object
     */
    public synchronized PathPoint getCurrentPoint() {
        if (points.isEmpty()) {
            return null;
        }
        return points.get(points.size() - 1);
    }

    public synchronized void getBestPoint(double x, double y, PathPoint[] theBest, double[] bestScore, long now) {
        for (PathPoint p : points) {
            if (!p.marker) {
                continue;
            }
            double dis = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
            if (dis > TrailManager.dotDistance) {
                continue;
            }
            if (now - p.born > p.life) {
                return;
            }
            //double score = (TrailManager.dotDistance - dis) * ((double) (p.life - now + p.born) / p.life);
            double score = (TrailManager.dotDistance - dis) * ((double) (now - p.born) / p.life);//oldest
            if (score > bestScore[0]) {
                theBest[0] = p;
                bestScore[0] = dis;
            }
        }
    }

}
