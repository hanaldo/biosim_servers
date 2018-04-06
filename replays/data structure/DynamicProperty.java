package shenshen.han.biosim.models;

public class DynamicProperty {

    //Some case-dependent properties for all kinds of game actors (or players)
    private Integer currentNectar, maxNectar, currentEnergy, maxEnergy, range,
            fakeX, fakeY, energyLoss, nectarLoss, positionId, homeHiveId, scoutFlowerId;
    private Boolean inHive, hasExit, doTrail, recruitAtHome;
    private String flowerType, nameTag;
    private int[] scout;
    private String dance;//for BeeSign
    private Integer nectarQuality;//for BeeSign
    private PathGroup pathGroup;
    private Integer bestX, bestY;//for Ant
    private Double velocityHeading;//for Ant
    private Integer foodPieceSize, numberOfCarrier;//for large food


}
