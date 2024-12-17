class Result<T, E = string> {
	public readonly isSuccess: boolean;
	public readonly isFailure: boolean;
	private readonly value?: T;
	private readonly error?: E;

	private constructor(isSuccess: boolean, value?: T, error?: E) {
		this.isSuccess = isSuccess;
		this.isFailure = !isSuccess;

		if (this.isSuccess) {
			this.value = value;
		} else {
			this.error = error;
		}
	}

	public getValue(): T {
		if (this.isFailure) {
			throw new Error("Can't get the value of a failed result.");
		}
		return this.value as T;
	}

	public getError(): E {
		if (this.isSuccess) {
			throw new Error("Can't get the error of a successful result.");
		}
		return this.error as E;
	}

	public static success<U>(value?: U): Result<U> {
		return new Result<U>(true, value);
	}

	public static fail<U, F = string>(error: F): Result<U, F> {
		return new Result<U, F>(false, undefined, error);
	}
}

export default Result;
