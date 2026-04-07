
import type { HydratedDocument, Model, UpdateQuery } from "mongoose";

import utilsService from "./utils.service";

type PlainObject = Record<string, unknown>;
type HookContext = Record<string, unknown>;
type HookFn<TPayload, TResult = TPayload> = (
	payload: TPayload,
	context: HookContext
) => TResult | Promise<TResult>;

const getCollectionName = (Model: Model<any>): string =>
	Model.collection?.collectionName ?? "document";

const getErrorMessage = (err: unknown): string => {
	if (err instanceof Error && err.message) {
		return err.message;
	}
	return "Operation failed";
};

const runHook = async <TPayload, TResult = TPayload>(
	hook: HookFn<TPayload, TResult> | undefined,
	payload: TPayload,
	context: HookContext
): Promise<TResult | TPayload> => {
	if (typeof hook === "function") {
		return hook(payload, context);
	}
	return payload;
};

const commonCheck = async ({
	Model,
	id,
	filter = {},
}: {
	Model?: Model<any>;
	id?: string;
 	filter?: PlainObject;
}): Promise<HydratedDocument<PlainObject>> => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	const finalFilter: Record<string, unknown> = { ...filter };

	if (id) {
		finalFilter._id = id;
	}

	const doc = await Model.findOne(finalFilter);

	if (!doc) {
		throw new utilsService.CustomAppError(
			`${getCollectionName(Model)} not found`,
			400,
			{ _id: id }
		);
	}

	return doc;
};

const getAll = async ({
	Model,
	queryString,
	filter = {},
	populate = [],
	searchFields = [],
	hooks = {},
	context = {},
}: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	await runHook(hooks.beforeGetAll, { filter, queryString }, context);

	const totalDocs = await Model.countDocuments(filter);

	const query = Model.find(filter);

	const features = utilsService
		.ApiFeatures(query, queryString, totalDocs)
		.filter()
		.search(searchFields)
		.sort()
		.limitFields()
		.paginate();

	let docs = await features.query;

	if (populate.length) {
		for (const item of populate) {
			docs = await Model.populate(docs, item);
		}
	}

	docs = (await runHook(hooks.afterGetAll, docs, context)) as unknown[];

	return {
		success: true as const,
		message: `${docs.length} ${getCollectionName(Model)} retrieved successfully`,
		data: docs,
		total: totalDocs,
	};
};

const getOne = async ({ Model, id, populate = [], hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	let doc = await commonCheck({ Model, id });

	await runHook(hooks.beforeGetOne, { id }, context);

	if (populate.length) {
		for (const item of populate) {
			doc = await Model.populate(doc, item);
		}
	}

	doc = (await runHook(hooks.afterGetOne, doc, context)) as HydratedDocument<PlainObject>;

	return {
		success: true as const,
		message: `${getCollectionName(Model)} retrieved successfully`,
		data: doc,
	};
};

const createOne = async ({ Model, data, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	const finalData = (await runHook(hooks.beforeCreate, data, context)) as Record<string, unknown>;

	let doc = await Model.create(finalData);

	doc = (await runHook(hooks.afterCreate, doc, context)) as HydratedDocument<PlainObject>;

	return {
		success: true as const,
		message: `${getCollectionName(Model)} created successfully`,
		data: doc,
	};
};

const updateOne = async ({ Model, id, data, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	const existingDoc = await commonCheck({ Model, id });

	await runHook(hooks.beforeUpdate, { existingDoc, data }, context);

	let updatedDoc = await Model.findByIdAndUpdate(
		id,
		{ $set: data } as UpdateQuery<any>,
		{ new: true, runValidators: true }
	);

	updatedDoc = (await runHook(
		hooks.afterUpdate,
		updatedDoc,
		context
	)) as HydratedDocument<PlainObject>;

	if (!updatedDoc) {
		throw new utilsService.CustomAppError(
			"Failed to update document",
			400,
			{ _id: id }
		);
	}

	return {
		success: true as const,
		message: `${getCollectionName(Model)} updated successfully`,
		data: updatedDoc,
	};
};

const deleteOne = async ({ Model, id, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	const doc = await commonCheck({ Model, id });

	await runHook(hooks.beforeDelete, doc, context);

	await Model.findByIdAndDelete(id);

	await runHook(hooks.afterDelete, doc, context);

	return {
		success: true as const,
		message: `${getCollectionName(Model)} deleted successfully`,
	};
};

const createMany = async ({ Model, data, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	const finalData = (await runHook(
		hooks.beforeCreateMany,
		data,
		context
	)) as Array<Record<string, unknown>>;

	let docs = await Model.insertMany(finalData);

	docs = (await runHook(
		hooks.afterCreateMany,
		docs,
		context
	)) as Array<HydratedDocument<PlainObject>>;

	return {
		success: true as const,
		message: `${docs.length} ${getCollectionName(Model)} created successfully`,
		data: docs,
	};
};

const updateMany = async ({ Model, filter, data, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	await runHook(hooks.beforeUpdateMany, { filter, data }, context);

	const result = await Model.updateMany(
		filter,
		{ $set: data } as UpdateQuery<any>,
		{ runValidators: true }
	);

	await runHook(hooks.afterUpdateMany, result, context);

	return {
		success: true as const,
		message: `${result.modifiedCount} ${getCollectionName(Model)} updated successfully`,
	};
};

const deleteMany = async ({ Model, filter, hooks = {}, context = {} }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	await runHook(hooks.beforeDeleteMany, filter, context);

	const result = await Model.deleteMany(filter);

	await runHook(hooks.afterDeleteMany, result, context);

	return {
		success: true as const,
		message: `${result.deletedCount} ${getCollectionName(Model)} deleted successfully`,
	};
};

const duplicateOne = async ({ Model, id, hooks = {}, context = {}, omitFields = [], duplicateNameConfig = null }: any) => {
	if (!Model) {
		throw new utilsService.CustomAppError("Model not provided", 400);
	}

	let doc = await commonCheck({ Model, id });

	await runHook(hooks.beforeDuplicate, doc, context);

	const data = doc.toObject() as Record<string, unknown>;

	delete data._id;

	omitFields.forEach((field: string) => {
		delete data[field];
	});

	if (duplicateNameConfig) {
		const { fieldName = "name", scope = {}, suffix = "copy" } = duplicateNameConfig;

		const rawValue = data[fieldName];

		if (typeof rawValue === "string") {
			data[fieldName] = `${rawValue} ${suffix}`;
		}
	}

	let newDoc: HydratedDocument<PlainObject>;

	try {
		newDoc = await Model.create(data);
	} catch (error) {
		throw new utilsService.CustomAppError(getErrorMessage(error), 400);
	}

	newDoc = (await runHook(
		hooks.afterDuplicate,
		newDoc,
		context
	)) as HydratedDocument<PlainObject>;

	return {
		success: true as const,
		message: `${getCollectionName(Model)} duplicated successfully`,
		data: newDoc,
	};
};


export const curdService = (defaultModel: Model<any>) => {
	return {
		getAll: (args: any = {}) => getAll({ ...args, Model: args.Model ?? defaultModel }),
		getOne: (args: any = {}) => getOne({ ...args, Model: args.Model ?? defaultModel }),
		createOne: (args: any = {}) => createOne({ ...args, Model: args.Model ?? defaultModel }),
		updateOne: (args: any = {}) => updateOne({ ...args, Model: args.Model ?? defaultModel }),
		deleteOne: (args: any = {}) => deleteOne({ ...args, Model: args.Model ?? defaultModel }),
		createMany: (args: any = {}) => createMany({ ...args, Model: args.Model ?? defaultModel }),
		updateMany: (args: any = {}) => updateMany({ ...args, Model: args.Model ?? defaultModel }),
		deleteMany: (args: any = {}) => deleteMany({ ...args, Model: args.Model ?? defaultModel }),
		duplicateOne: (args: any = {}) => duplicateOne({ ...args, Model: args.Model ?? defaultModel }),
	};
};

export default curdService;
