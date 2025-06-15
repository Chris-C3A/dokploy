import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { applications } from "./application";
import { compose } from "./compose";
import { deployments } from "./deployment";
import { domains } from "./domain";
import { applicationStatus } from "./shared";
import { generateAppName } from "./utils";

export const previewDeployments = pgTable("preview_deployments", {
	previewDeploymentId: text("previewDeploymentId")
		.notNull()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	branch: text("branch").notNull(),
	pullRequestId: text("pullRequestId").notNull(),
	pullRequestNumber: text("pullRequestNumber").notNull(),
	pullRequestURL: text("pullRequestURL").notNull(),
	pullRequestTitle: text("pullRequestTitle").notNull(),
	pullRequestCommentId: text("pullRequestCommentId").notNull(),
	previewStatus: applicationStatus("previewStatus").notNull().default("idle"),
	appName: text("appName")
		.notNull()
		.$defaultFn(() => generateAppName("preview"))
		.unique(),
	applicationId: text("applicationId").references(() => applications.applicationId, {
		onDelete: "cascade",
	}),
	composeId: text("composeId").references(() => compose.composeId, {
		onDelete: "cascade",
	}),
	domainId: text("domainId").references(() => domains.domainId, {
		onDelete: "cascade",
	}),
	createdAt: text("createdAt")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	expiresAt: text("expiresAt"),
});

export const previewDeploymentsRelations = relations(
	previewDeployments,
	({ one, many }) => ({
		deployments: many(deployments),
		domain: one(domains, {
			fields: [previewDeployments.domainId],
			references: [domains.domainId],
		}),
		application: one(applications, {
			fields: [previewDeployments.applicationId],
			references: [applications.applicationId],
		}),
		compose: one(compose, {
			fields: [previewDeployments.composeId],
			references: [compose.composeId],
		}),
	}),
);

export const createSchema = createInsertSchema(previewDeployments, {
	applicationId: z.string().optional(),
	composeId: z.string().optional(),
});

export const apiCreatePreviewDeployment = createSchema
	.pick({
		applicationId: true,
		domainId: true,
		branch: true,
		pullRequestId: true,
		pullRequestNumber: true,
		pullRequestURL: true,
		pullRequestTitle: true,
	})
	.extend({
		applicationId: z.string().min(1),
		// deploymentId: z.string().min(1),
	})
	.superRefine((input, ctx) => {
		if (!input.applicationId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["applicationId"],
				message: "Application ID is required for application preview deployments",
			});
		}
	});

export const apiCreateComposePreviewDeployment = createSchema
	.pick({
		composeId: true,
		domainId: true,
		branch: true,
		pullRequestId: true,
		pullRequestNumber: true,
		pullRequestURL: true,
		pullRequestTitle: true,
	})
	.extend({
		composeId: z.string().min(1),
	})
	.superRefine((input, ctx) => {
		if (!input.composeId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["composeId"],
				message: "Compose ID is required for compose preview deployments",
			});
		}
	});
