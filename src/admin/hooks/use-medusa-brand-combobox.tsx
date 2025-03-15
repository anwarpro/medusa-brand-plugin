import { QueryKey } from "@tanstack/react-query";
import { useComboboxData } from "./use-combobox-data";
import {sdk} from "../lib/sdk.ts";

type BrandResponse = {
    brands: { id: string; name: string }[];
    count: number;
    offset: number;
    limit: number;
};

type BrandQueryParams = {
    id?: string;
    q?: string;
    offset?: number;
    limit?: number;
};

const fetchBrands = async (params: BrandQueryParams): Promise<BrandResponse> => {
    const { q, offset = 0, limit = 10 } = params;
    const query: { limit: number; offset: number; q?: string } = { limit, offset };
    if (q) query.q = q;

    const data = await sdk.client.fetch(`/admin/brands`, { query }) as BrandResponse;

    return {
        brands: data.brands,
        count: data.count,
        offset: data.offset || offset,
        limit: data.limit || limit,
    };
};

const getBrandOptions = (data: BrandResponse) =>
    data.brands.map((brand) => ({
        label: brand.name,
        value: brand.id,
    }));

export const useMedusaBrandCombobox = ({
                                           defaultValue,
                                           pageSize = 10,
                                       }: {
    defaultValue?: string | string[];
    pageSize?: number;
}) => {
    const queryKey: QueryKey = ["brands"];

    return useComboboxData<BrandResponse, BrandQueryParams>({
        queryKey,
        queryFn: fetchBrands,
        getOptions: getBrandOptions,
        defaultValue,
        defaultValueKey: "id",
        pageSize,
    });
};