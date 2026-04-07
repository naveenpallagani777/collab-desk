import type { QueryLike, QueryStringObject } from "../types";

export class CustomAppError extends Error {
	statusCode: number;
	data?: Record<string, unknown> | undefined;

	constructor(message: string, statusCode: number, data?: Record<string, unknown>) {
		super(message);
		this.name = "CustomAppError";
		this.statusCode = statusCode;
		this.data = data;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export function ApiFeatures(
	query: QueryLike,
	queryString: QueryStringObject = {},
	totalDocs = 0
) {
	return {
		query,
		queryString,
		totalDocs,

		filter(excludedFields: string[] = []) {
			const queryObj: QueryStringObject = { ...this.queryString };
			const defaultExcludedFields = [
				"page",
				"sort",
				"limit",
				"fields",
				"max",
				"min",
				"search",
				"lat",
				"lng",
			];

			[...excludedFields, ...defaultExcludedFields].forEach((field) => {
				delete queryObj[field];
			});

			let queryStr = JSON.stringify(queryObj);
			queryStr = queryStr.replace(/\b(gt|gte|lt|lte|ne|in|nin|all)\b/g, (match) => `$${match}`);

			const parsedQuery = JSON.parse(queryStr) as Record<string, unknown>;
			for (const field of Object.keys(parsedQuery)) {
				const fieldValue = parsedQuery[field];
				if (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
					for (const op of Object.keys(fieldValue as Record<string, unknown>)) {
						const value = (fieldValue as Record<string, unknown>)[op];
						if (typeof value === "string" && value.includes(",")) {
							(fieldValue as Record<string, unknown>)[op] = value.split(",");
						}
					}
				}
			}

			this.query = this.query.find(parsedQuery);
			return this;
		},

		sort() {
			if (this.queryString.sort) {
				const sortBy = String(this.queryString.sort).split(",").join(" ");
				this.query = this.query.sort(`${sortBy} _id`);
			} else {
				this.query = this.query.sort("-createdAt -_id");
			}
			return this;
		},

		search(searchFields: string[] = []) {
			if (this.queryString.search && searchFields.length > 0) {
				const searchQuery = String(this.queryString.search).trim();
				const searchConditions = searchFields.map((field) => ({
					[field]: { $regex: searchQuery, $options: "i" },
				}));
				this.query = this.query.find({ $or: searchConditions });
			}
			return this;
		},

		limitFields() {
			if (this.queryString.fields) {
				const fields = String(this.queryString.fields).split(",").join(" ");
				this.query = this.query.select(fields);
			} else {
				this.query = this.query.select("-__v");
			}
			return this;
		},

		paginate() {
			const page = Number(this.queryString.page) || 1;
			const limit = Number(this.queryString.limit) || 10;
			const skip = (page - 1) * limit;

			this.query = this.query.skip(skip).limit(limit);

			if (this.queryString.page && this.totalDocs > 0) {
				const totalPages = Math.ceil(this.totalDocs / limit);
				if (page > totalPages) {
					throw new CustomAppError("This page does not exist", 400, { page });
				}
			}

			return this;
		},
	};
}

const Utils = {
	ApiFeatures,
	CustomAppError,
};

export default Utils;
