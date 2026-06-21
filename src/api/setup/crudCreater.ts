// import {
//   QueryClient,
//   useMutation,
//   useQuery,
//   useQueryClient,
//   UseQueryOptions,
//   UseMutationOptions,
// } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import axiosInstance from "./axiosInstance"; // Your axios instance
// import { AxiosError } from "axios";

// // ===================================================
// // TYPES
// // ===================================================

// interface ApiError {
//   message?: string;
//   error?: Array<{ message: string }>;
// }

// interface CreateApiConfigOptions {
//   entityName: string;
//   entityNameFormatted: string;
//   additionalQueriesToInvalidate?: string[];
//   showSuccessToast?: boolean;
// }

// interface MutationData<T> {
//   entityData: T;
//   id: string;
// }

// // ===================================================
// // CRUD CREATOR
// // ===================================================

// export function createApiConfig<T = any>(options: CreateApiConfigOptions) {
//   const {
//     entityName,
//     entityNameFormatted,
//     additionalQueriesToInvalidate = [],
//     showSuccessToast = true,
//   } = options;

//   // ===================================================
//   // HELPER: Invalidate Queries
//   // ===================================================
//   const invalidateQueries = (queryClient: QueryClient) => {
//     queryClient.invalidateQueries({ queryKey: [entityName] });

//     additionalQueriesToInvalidate.forEach((key) => {
//       queryClient.invalidateQueries({ queryKey: [key] });
//     });
//   };

//   // ===================================================
//   // HELPER: Error Handler
//   // ===================================================
//   const handleError = (error: unknown, action: string) => {
//     toast.dismiss();

//     const axiosError = error as AxiosError<ApiError>;

//     // Check for array error format
//     if (axiosError.response?.data?.error?.[0]?.message) {
//       toast.error(axiosError.response.data.error[0].message);
//       return;
//     }

//     // Check for message property
//     if (axiosError.response?.data?.message) {
//       toast.error(axiosError.response.data.message);
//       return;
//     }

//     // Fallback
//     toast.error(`Error ${action} ${entityNameFormatted}`);
//   };

//   // ===================================================
//   // GET ALL
//   // ===================================================
//   const useGetAll = (
//     queryParams?: Record<string, any>,
//     options?: Partial<UseQueryOptions<T[], Error>>
//   ) => {
//     const queryKey = queryParams
//       ? [entityName, "all", queryParams]
//       : [entityName, "all"];

//     return useQuery<T[], Error>({
//       queryKey,
//       queryFn: async () => {
//         const { data } = await axiosInstance.get(`/${entityName}`, {
//           params: queryParams,
//         });
//         return data;
//       },
//       ...options,
//     });
//   };

//   // ===================================================
//   // GET BY ID
//   // ===================================================
//   const useGetById = (
//     id: string,
//     queryParams?: Record<string, any>,
//     options?: Partial<UseQueryOptions<T, Error>>
//   ) => {
//     const queryKey = queryParams
//       ? [entityName, id, queryParams]
//       : [entityName, id];

//     return useQuery<T, Error>({
//       queryKey,
//       queryFn: async () => {
//         const { data } = await axiosInstance.get(`/${entityName}/${id}`, {
//           params: queryParams,
//         });
//         return data?.data || data;
//       },
//       enabled: !!id,
//       ...options,
//     });
//   };

//   // ===================================================
//   // CREATE
//   // ===================================================
//   const useCreate = (
//     options?: UseMutationOptions<any, Error, T>
//   ) => {
//     const queryClient = useQueryClient();

//     return useMutation<any, Error, T>({
//       mutationFn: async (entityData: T) => {
//         const { data } = await axiosInstance.post(`/${entityName}`, entityData);
//         return data;
//       },
//       onMutate: () => {
//         toast.dismiss();
//       },
//       onSuccess: (data, variables, context) => {
//         invalidateQueries(queryClient);

//         if (showSuccessToast) {
//           toast.success(`${entityNameFormatted} Created Successfully`);
//         }

//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onSuccess?.(data, variables, context);
//       },
//       onError: (error, variables, context) => {
//         handleError(error, "Creating");
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onError?.(error, variables, context);
//       },
//       retry: false,
//       ...options,
//     });
//   };

//   // ===================================================
//   // UPDATE
//   // ===================================================
//   const useUpdate = (
//     options?: UseMutationOptions<any, Error, MutationData<T>>
//   ) => {
//     const queryClient = useQueryClient();

//     return useMutation<any, Error, MutationData<T>>({
//       mutationFn: async ({ entityData, id }) => {
//         const { data } = await axiosInstance.patch(
//           `/${entityName}/${id}`,
//           entityData
//         );
//         return data;
//       },
//       onMutate: () => {
//         toast.dismiss();
//       },
//       onSuccess: (data, variables, context) => {
//         invalidateQueries(queryClient);

//         if (showSuccessToast) {
//           toast.success(`${entityNameFormatted} Updated Successfully`);
//         }

//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onSuccess?.(data, variables, context);
//       },
//       onError: (error, variables, context) => {
//         handleError(error, "Updating");
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onError?.(error, variables, context);
//       },
//       retry: false,
//       ...options,
//     });
//   };

//   // ===================================================
//   // DELETE
//   // ===================================================
//   const useDelete = (
//     options?: UseMutationOptions<void, Error, string>
//   ) => {
//     const queryClient = useQueryClient();

//     return useMutation<void, Error, string>({
//       mutationFn: async (id: string) => {
//         await axiosInstance.delete(`/${entityName}?id=[${id}]`);
//       },
//       onSuccess: (data, variables, context) => {
//         invalidateQueries(queryClient);
//         toast.success(`${entityNameFormatted} Deleted Successfully`);
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onSuccess?.(data, variables, context);
//       },
//       onError: (error, variables, context) => {
//         toast.error(`Error Deleting ${entityNameFormatted}`);
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onError?.(error, variables, context);
//       },
//       ...options,
//     });
//   };

//   // ===================================================
//   // DELETE WITH QUERY PARAMS
//   // ===================================================
//   const useDeleteWithQuery = (
//     options?: UseMutationOptions<void, Error, Record<string, any> | undefined>
//   ) => {
//     const queryClient = useQueryClient();

//     return useMutation<void, Error, Record<string, any> | undefined>({
//       mutationFn: async (queryParams) => {
//         await axiosInstance.delete(`/${entityName}`, {
//           params: queryParams,
//         });
//       },
//       onSuccess: (data, variables, context) => {
//         invalidateQueries(queryClient);
//         toast.success(`${entityNameFormatted} Deleted Successfully`);
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onSuccess?.(data, variables, context);
//       },
//       onError: (error, variables, context) => {
//         toast.error(`Error Deleting ${entityNameFormatted}`);
//         // @ts-ignore - TS expects 4 args but React Query defines 3
//         options?.onError?.(error, variables, context);
//       },
//       ...options,
//     });
//   };


//   return {
//     useGetAll,
//     useGetById,
//     useCreate,
//     useUpdate,
//     useDelete,
//     useDeleteWithQuery,
//   };
// }

// // ===================================================
// // USAGE EXAMPLE
// // ===================================================

// /*
// interface User {
//   id: string;
//   name: string;
//   email: string;
// }

// const userApi = createApiConfig<User>({
//   entityName: "users",
//   entityNameFormatted: "User",
//   additionalQueriesToInvalidate: ["teams"],
//   showSuccessToast: true,
// });

// // In your component:
// const { data: users, isLoading } = userApi.useGetAll();
// const { data: user } = userApi.useGetById("123");
// const createMutation = userApi.useCreate();
// const updateMutation = userApi.useUpdate();
// const deleteMutation = userApi.useDelete();

// // With custom callbacks:
// const createMutation = userApi.useCreate({
//   onSuccess: (data) => {
//     console.log("Custom success handler", data);
//   },
// });

// createMutation.mutate({ name: "John", email: "john@example.com" });
// updateMutation.mutate({ entityData: { name: "Jane" }, id: "123" });
// deleteMutation.mutate("123");
// */