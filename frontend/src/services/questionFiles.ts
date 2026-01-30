import { api } from "../configs/api";

import type { QuestionFile } from "../types/tests/TestManagement";

export const QuestionFilesService = {
    upload: async (
        questionId: number,
        files: File[],
    ): Promise<QuestionFile[]> => {
        const form = new FormData();
        files.forEach((file) => form.append("files[]", file));

        const response = await api.post<{ files: QuestionFile[] }>(
            `/workbench/questions/${questionId}/files`,
            form,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        return response.data.files;
    },

    delete: async (questionId: number, fileId: number): Promise<void> => {
        await api.delete(`/workbench/questions/${questionId}/files/${fileId}`);
    },
};
