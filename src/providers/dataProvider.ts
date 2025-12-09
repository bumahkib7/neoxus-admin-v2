import type { DataProvider, LogicalFilter, ConditionalFilter, CrudSort, GetListParams } from "@refinedev/core";
import type { AxiosInstance } from "axios";
import qs from "query-string";

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance
): DataProvider => ({
  getList: async (params: GetListParams) => {
    const { resource, pagination, filters, sorters } = params;
    const url = apiUrl + "/" + resource;
    const current = (pagination as any)?.current ?? 1;
    const pageSize = (pagination as any)?.pageSize ?? 10;
    const queryFilters: Record<string, any> = {};
    
    if (filters) {
      filters.forEach((filter: LogicalFilter | ConditionalFilter) => {
        if ("field" in filter) {
          queryFilters[filter.field] = filter.value;
        }
      });
    }

    const query: any = {
      page: current - 1,
      size: pageSize,
      ...queryFilters,
    };

    if (sorters && sorters.length > 0) {
      query.sort = sorters.map((s: CrudSort) => s.field + "," + s.order).join("&sort=");
    }

    const { data } = await httpClient.get(url + "?" + qs.stringify(query));
    console.log("📦 Data Provider Response:", {
      url: url + "?" + qs.stringify(query),
      rawData: data,
      content: data.content,
      total: data.page?.totalElements
    });
    return {
      data: data.content || data.collections || [],
      total: data.page?.totalElements || data.count || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await httpClient.get(apiUrl + "/" + resource + "/" + id);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const { data } = await httpClient.post(apiUrl + "/" + resource, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await httpClient.put(apiUrl + "/" + resource + "/" + id, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await httpClient.delete(apiUrl + "/" + resource + "/" + id);
    return { data };
  },

  getApiUrl: () => apiUrl,
});
