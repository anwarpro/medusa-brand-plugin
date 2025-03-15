import * as zod from "zod";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Heading, Input, Text, toast} from "@medusajs/ui";
import {RouteFocusModal, useRouteModal} from "../../../components/modals";
import {Form} from "../../../components/common/form";
import {useBrand} from "../../../hooks/brands.tsx";
import {KeyboundForm} from "../../../components/utilities/keybound-form";

const CreateBrandSchema = zod.object({
    name: zod.string().min(1)
})

export const CreateBrandForm = () => {
    const {t} = useTranslation()
    const {handleSuccess} = useRouteModal()

    const form = useForm<zod.infer<typeof CreateBrandSchema>>({
        defaultValues: {
            name: ""
        },
        resolver: zodResolver(CreateBrandSchema),
    })

    const {mutateAsync, isPending} = useBrand()

    const handleSubmit = form.handleSubmit(async (data) => {
        await mutateAsync(data, {
            onSuccess: ({}) => {
                handleSuccess(`/brands`)
                toast.success("Brand created successfully.")
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    })

    return (
        <RouteFocusModal.Form form={form}>
            <KeyboundForm onSubmit={handleSubmit}>
                <RouteFocusModal.Header>
                    <div className="flex items-center justify-end gap-x-2">
                        <RouteFocusModal.Close asChild>
                            <Button size="small" variant="secondary">
                                {t("actions.cancel")}
                            </Button>
                        </RouteFocusModal.Close>
                        <Button
                            size="small"
                            variant="primary"
                            type="submit"
                            isLoading={isPending}
                        >
                            {t("actions.create")}
                        </Button>
                    </div>
                </RouteFocusModal.Header>
                <RouteFocusModal.Body className="flex flex-col items-center p-16">
                    <div className="flex w-full max-w-[720px] flex-col gap-y-8">
                        <div>
                            <Heading>{t("collections.createCollection")}</Heading>
                            <Text size="small" className="text-ui-fg-subtle">
                                {t("collections.createCollectionHint")}
                            </Text>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Form.Field
                                control={form.control}
                                name="name"
                                render={({field}) => {
                                    return (
                                        <Form.Item>
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control>
                                                <Input autoComplete="off" {...field} />
                                            </Form.Control>
                                            <Form.ErrorMessage/>
                                        </Form.Item>
                                    )
                                }}
                            />
                            {/*<Form.Field
                                control={form.control}
                                name="handle"
                                render={({field}) => {
                                    return (
                                        <Form.Item>
                                            <Form.Label
                                                optional
                                                tooltip={t("collections.handleTooltip")}
                                            >
                                                {t("fields.handle")}
                                            </Form.Label>
                                            <Form.Control>
                                                <HandleInput {...field} />
                                            </Form.Control>
                                            <Form.ErrorMessage/>
                                        </Form.Item>
                                    )
                                }}
                            />*/}
                        </div>
                    </div>
                </RouteFocusModal.Body>
            </KeyboundForm>
        </RouteFocusModal.Form>
    )
}