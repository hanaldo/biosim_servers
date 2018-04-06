package shenshen.han.biosim.models;

/**
 *
 * @author hanaldo
 */
public interface GameActorTypes {

    public static final String Actor_Bee = "b";
    public static final String Actor_Hive = "h";//hive for Bee, or colony/home for Ant
    public static final String Actor_Flower = "f";//flower for Bee, or food resource for Ant
    public static final String Actor_Fountain = "fountain";
    public static final String Actor_Hive_Exit = "hive-exit";
    public static final String Actor_Ant = "a";
    public static final int Background_Actor_Reduce_Energy = -2;
    public static final int Background_Actor_Reduce_Nectar = -3;
    public static final int Background_Actor_Make_Rain = -4;
    public static final int Background_Actor_Make_Sun = -5;
    public static final int Background_Actor_Make_Snow = -6;
    public static final int Background_Actor_Add_Energy = -7;
}
