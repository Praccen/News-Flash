import IntersectionInformation from "./IntersectionInformation.js";
import Vec3 from "../Maths/Vec3.js";

export module CollisionSolver {
    export function getTranslationNeeded(intersectionInformation: Array<IntersectionInformation>): Vec3 {
        if (intersectionInformation.length == 0) {
            return new Vec3();
        }

        // Add all the intersection axises (with depth).
        let resultingVec = new Vec3();
        let maxDepth = 0.0;
        for (let inf of intersectionInformation) {
            if (inf.depth > maxDepth) {
                resultingVec.deepAssign(inf.axis);
                maxDepth = inf.depth;
            }
            // resultingVec.add(new Vec3(inf.axis).multiply(inf.depth));
        }
        resultingVec.multiply(maxDepth);

        // Take the resulting vector and try to make it not go against any of the intersection axises
        // for (let inf of intersectionInformation) {
        //     let intAxis = new Vec3(inf.axis).normalize();
        //     let dotProd = resultingVec.dot(intAxis);
        //     if (dotProd < 0.0) {
        //         resultingVec.subtract(new Vec3(intAxis).multiply(dotProd));
        //     }
        // }

        // If it still goes against something by the end of this, I think it is a case of the object not actually fitting in a space,
        // and we will leave that behaivior as undefined

        return resultingVec;
    }
}