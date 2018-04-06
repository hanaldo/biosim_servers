package shenshen.han.biosim.models;

/**
 *
 * @author hanaldo
 */
public interface GameActionTypes {

    public static final String Action_Touch = "touch";//For getting food/nectar or getting in/out of hive/colony(h)
    public static final String Action_Change_Setting = "changeSetting";
    public static final String Action_Reduce_Energy = "reduceEnergy";//A time counter which reduces everyone's energy level
    public static final String Action_Make_Rain = "makeRain";
    public static final String Action_Make_Sun = "makeSun";
    public static final String Action_Make_Snow = "makeSnow";
    public static final String Action_Reduce_Nectar = "reduceNectar";
    public static final String Action_Revive_Bee = "reviveBee";//Revive a game player (bee or ant)
    public static final String Action_Bee_Out = "beeOut";
    public static final String Action_Add_Energy = "addEnergy";
    public static final String Action_Check_Track = "checkTrack";
    public static final int Depletion_Rate_None = 0;
    public static final int Depletion_Rate_Slow = 1;
    public static final int Depletion_Rate_Medium = 2;
    public static final int Depletion_Rate_Fast = 4;
}
