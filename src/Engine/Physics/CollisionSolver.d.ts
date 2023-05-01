import IntersectionInformation from "./IntersectionInformation";
import Vec3 from "../Maths/Vec3";
export declare module CollisionSolver {
    function getTranslationNeeded(intersectionInformation: Array<IntersectionInformation>): Vec3;
}
