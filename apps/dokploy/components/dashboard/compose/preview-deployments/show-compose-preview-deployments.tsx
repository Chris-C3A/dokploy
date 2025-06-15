import { api } from "@/utils/api";
import { Loader2, RocketIcon } from "lucide-react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface Props {
	composeId: string;
}

export const ShowComposePreviewDeployments = ({ composeId }: Props) => {
	const { data } = api.compose.one.useQuery({ composeId });

	const { mutateAsync: deletePreviewDeployment, isLoading } =
		api.compose.deletePreviewDeployment.useMutation();

	const {
		data: previewDeployments,
		refetch: refetchPreviewDeployments,
		isLoading: isLoadingPreviewDeployments,
	} = api.compose.previewDeployments.useQuery(
		{ composeId },
		{
			enabled: !!composeId,
		},
	);

	const handleDeletePreviewDeployment = async (previewDeploymentId: string) => {
		deletePreviewDeployment({
			previewDeploymentId: previewDeploymentId,
		})
			.then(() => {
				refetchPreviewDeployments();
				toast.success("Preview deployment deleted");
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
				<div className="flex flex-col gap-2">
					<CardTitle className="text-xl">Preview Deployments</CardTitle>
					<CardDescription>See all the preview deployments for this compose service</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2 text-sm">
					<span>
						Preview deployments are a way to test your compose service before it
						is deployed to production. It will create a new deployment for
						each pull request you create.
					</span>
				</div>
				{isLoadingPreviewDeployments ? (
					<div className="flex w-full flex-row items-center justify-center gap-3 min-h-[35vh]">
						<Loader2 className="size-5 text-muted-foreground animate-spin" />
						<span className="text-base text-muted-foreground">
							Loading...
						</span>
					</div>
				) : previewDeployments && previewDeployments.length > 0 ? (
					<div className="flex flex-col gap-4">
						{previewDeployments.map((previewDeployment) => {
							return (
								<div
									key={previewDeployment.previewDeploymentId}
									className="flex flex-col gap-4 rounded-lg border p-4"
								>
									<div className="flex flex-row items-center justify-between">
										<div className="flex flex-row items-center gap-2">
											<div className="h-3 w-3 rounded-full bg-green-500" />
											<span className="text-sm font-medium">
												{previewDeployment.pullRequestTitle}
											</span>
										</div>
										<div className="flex flex-row gap-2">
											<button
												type="button"
												onClick={() =>
													handleDeletePreviewDeployment(
														previewDeployment.previewDeploymentId,
													)
												}
												className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
											>
												Delete
											</button>
										</div>
									</div>
									<div className="flex flex-col gap-2">
										<div className="text-sm text-muted-foreground">
											Branch: {previewDeployment.branch}
										</div>
										<div className="text-sm text-muted-foreground">
											PR #{previewDeployment.pullRequestNumber}
										</div>
										<div className="text-sm text-muted-foreground">
											Status: {previewDeployment.previewStatus}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex w-full flex-col items-center justify-center gap-3 pt-10">
						<RocketIcon className="size-8 text-muted-foreground" />
						<span className="text-base text-muted-foreground">
							No preview deployments found for this compose service
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
};