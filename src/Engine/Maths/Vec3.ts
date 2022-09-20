export default class Vec3 {
	x: number;
	y: number;
	z: number;

	constructor(base?: any) {
		if (base) {
			this.x = base.x;
			this.y = base.y;
			this.z = base.z;
		} else {
			this.x = 0.0;
			this.y = 0.0;
			this.z = 0.0;
		}
	}

	elements(): number[] {
		return [this.x, this.y, this.z];
	}

	vector3(): Vector3 {
		let retVec = new Vector3(null);
		retVec.elements[0] = this.x;
		retVec.elements[1] = this.y;
		retVec.elements[2] = this.z;
		return retVec;
	}

	setValues(x?: number, y?: number, z?: number): Vec3 {
		if (x) {
			this.x = x;
		}
		if (y) {
			this.y = y;
		}
		if (z) {
			this.z = z;
		}

		return this;
	}

	deepAssign(base: any): Vec3 {
		this.x = base.x;
		this.y = base.y;
		this.z = base.z;

		return this;
	}

	compare(other: any): boolean {
		return this.x == other.x && this.y == other.y && this.z == other.z;
	}

	length(): number {
		return Math.sqrt(
			Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2)
		);
	}

	length2(): number {
		return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
	}

	/**
	 * Normalizes the vector and returns it.
	 * It does not return a copy, so this will change the instance itself.
	 */
	normalize(): Vec3 {
		const length = this.length();
		if (length > 0.0) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}
		return this;
	}

	dot(otherVec: Vec3): number {
		return this.x * otherVec.x + this.y * otherVec.y + this.z * otherVec.z;
	}

	cross(otherVec: Vec3): Vec3 {
		let tempVec: Vec3 = new Vec3();
		tempVec.x = this.y * otherVec.z - this.z * otherVec.y;
		tempVec.y = this.x * otherVec.z - this.z * otherVec.x;
		tempVec.z = this.x * otherVec.y - this.y * otherVec.x;
		this.deepAssign(tempVec);
		return this;
	}

	flip(): Vec3 {
		this.x *= -1.0;
		this.y *= -1.0;
		this.z *= -1.0;
		return this;
	}

	add(vec: Vec3): Vec3 {
		this.x += vec.x;
		this.y += vec.y;
		this.z += vec.z;
		return this;
	}

	subtract(vec: Vec3): Vec3 {
		this.x -= vec.x;
		this.y -= vec.y;
		this.z -= vec.z;
		return this;
	}

	multiply(mult: number): Vec3 {
		this.x *= mult;
		this.y *= mult;
		this.z *= mult;
		return this;
	}

	min(vec: Vec3): Vec3 {
		this.x = Math.min(this.x, vec.x);
		this.y = Math.min(this.y, vec.y);
		this.z = Math.min(this.z, vec.z);
		return this;
	}

	max(vec: Vec3): Vec3 {
		this.x = Math.max(this.x, vec.x);
		this.y = Math.max(this.y, vec.y);
		this.z = Math.max(this.z, vec.z);
		return this;
	}
}
