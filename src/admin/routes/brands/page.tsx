import {defineRouteConfig} from "@medusajs/admin-sdk"
import {PencilSquare, TagSolid, Trash} from "@medusajs/icons"
import {
    Container,
    Heading,
    DataTable,
    createDataTableColumnHelper,
    useDataTable,
    type DataTablePaginationState,
    Button
} from "@medusajs/ui"
import {useQuery} from "@tanstack/react-query"
import {sdk} from "../../lib/sdk"
import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {useTranslation} from "react-i18next";
import {ActionMenu} from "../../components/common/action-menu";
import {brandsQueryKeys, useDeleteBrandAction} from "../../hooks/brands.tsx";

const BrandsPage = () => {
    const limit = 15
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: limit,
        pageIndex: 0,
    })
    const offset = useMemo(() => {
        return pagination.pageIndex * limit
    }, [pagination])

    const {data, isLoading} = useQuery<BrandsResponse>({
        queryFn: () => sdk.client.fetch(`/admin/brands`, {
            query: {
                limit,
                offset,
            },
        }),
        queryKey: brandsQueryKeys.lists(),
    })

    const table = useDataTable({
        columns,
        data: data?.brands || [],
        getRowId: (row) => row.id,
        rowCount: data?.count || 0,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
    })

    return (
        <Container className="divide-y p-0">
            <DataTable instance={table}>
                <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
                    <Heading level="h2">Brands</Heading>
                    <div className="flex items-center justify-center gap-x-2">
                        <Button size="small" variant="secondary" asChild>
                            <Link to="create">Create</Link>
                        </Button>
                    </div>
                </DataTable.Toolbar>
                <DataTable.Table/>
                <DataTable.Pagination/>
            </DataTable>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Brands",
    icon: TagSolid,
})

type Brand = {
    id: string
    name: string
}
type BrandsResponse = {
    brands: Brand[]
    count: number
    limit: number
    offset: number
}

const BrandRowActions = ({
                             brand,
                         }: {
    brand: Brand
}) => {
    const {t} = useTranslation()
    const handleDelete = useDeleteBrandAction(brand)

    return (
        <ActionMenu
            groups={[
                {
                    actions: [
                        {
                            label: t("actions.edit"),
                            icon: <PencilSquare/>,
                            to: `${brand.id}/edit`,
                        },
                    ],
                },
                {
                    actions: [
                        {
                            label: t("actions.delete"),
                            icon: <Trash/>,
                            onClick: handleDelete,
                        },
                    ],
                },
            ]}
        />
    )
}

const columnHelper = createDataTableColumnHelper<Brand>()


const columns = [
    columnHelper.accessor("id", {
        header: "ID",
    }),

    columnHelper.accessor("name", {
        header: "Name",
    }),
    columnHelper.display({
        id: "actions",
        cell: ({row}) => {
            return <BrandRowActions brand={row.original}/>
        },
    })
]

export default BrandsPage