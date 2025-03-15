import {useMutation, UseMutationOptions, useQueryClient} from "@tanstack/react-query";
import {FetchError} from "@medusajs/js-sdk";
import {sdk} from "../lib/sdk.ts";
import {HttpTypes} from "@medusajs/types";
import {queryKeysFactory} from "../lib/query-key-factory.ts";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {toast, usePrompt} from "@medusajs/ui";
import {DeleteResponse, PaginatedResponse} from "@medusajs/types/dist/http/common";

const BRANDS_QUERY_KEY = "brands" as const
export const brandsQueryKeys = queryKeysFactory(BRANDS_QUERY_KEY)

const PRODUCTS_QUERY_KEY = "products" as const
export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY)

export interface AdminCreateBrand {
    /**
     * The collection's title.
     */
    name: string;
    /**
     * The collection's handle.
     */
    // handle?: string;
    /**
     * Key-value pairs of custom data.
     */
    // metadata?: Record<string, any>;
}

export interface AdminBrandResponse {
    /**
     * The collection's details.
     */
    brand: {
        id: string,
        name: string,
        handle?: string
    };
}

export interface AdminProductBrandUpdate extends HttpTypes.AdminUpdateProduct {
    additional_data: {
        brand_id?: string;
    }
}

export const useBrand = (
    options?: UseMutationOptions<
        AdminBrandResponse,
        FetchError,
        AdminCreateBrand
    >
) => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => sdk.client.fetch("/admin/brands", {
            method: "POST",
            body: payload,
        }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({queryKey: brandsQueryKeys.lists()})

            options?.onSuccess?.(data, variables, context)
        },
        ...options,
    })
}

export const useUpdateProduct = (
    id: string,
    options?: UseMutationOptions<
        HttpTypes.AdminProductResponse,
        FetchError,
        AdminProductBrandUpdate
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => sdk.admin.product.update(id, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: productsQueryKeys.lists(),
            })
            await queryClient.invalidateQueries({
                queryKey: productsQueryKeys.detail(id),
            })
            await queryClient.invalidateQueries({
                queryKey: [["product", id]],
            })

            options?.onSuccess?.(data, variables, context)
        },
        ...options,
    })
}

type Brand = {
    id: string
    name: string
    handle?: string
}

export const useDeleteBrandAction = (
    brand: Brand
) => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const prompt = usePrompt()

    const {mutateAsync} = useDeleteBrand(brand.id)

    const handleDelete = async () => {
        const res = await prompt({
            title: t("general.areYouSure"),
            description: t("categories.delete.confirmation", {
                name: brand.name,
            }),
            confirmText: t("actions.delete"),
            cancelText: t("actions.cancel"),
        })

        if (!res) {
            return
        }

        await mutateAsync(undefined, {
            onSuccess: () => {
                toast.success(
                    t("categories.delete.successToast", {
                        name: brand.name,
                    })
                )

                navigate("/brands", {
                    replace: true,
                })
            },
            onError: (e) => {
                toast.error(e.message)
            },
        })
    }

    return handleDelete
}

export interface AdminBrandResponse {
    /**
     * The category's details.
     */
    brand: Brand;
}

export interface AdminProductCategoryListResponse extends PaginatedResponse<{
    /**
     * The list of product categories.
     */
    brands: Brand[];
}> {
}

export interface AdminBrandDeleteResponse extends DeleteResponse<"brand"> {
}

export const useDeleteBrand = (
    id: string,
    options?: UseMutationOptions<
        AdminBrandDeleteResponse,
        FetchError,
        void
    >
) => {
    const queryClient = useQueryClient();

    return useMutation({
        // @ts-ignore
        mutationFn: () => sdk.client.fetch("/admin/brands/" + `${id}`, {
            method: "DELETE",
            body: {},
        }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({
                queryKey: brandsQueryKeys.detail(id),
            })
            queryClient.invalidateQueries({queryKey: brandsQueryKeys.lists()})

            options?.onSuccess?.(data, variables, context)
        },
        ...options,
    })
}