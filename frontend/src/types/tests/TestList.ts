export type TestListSort = "title_asc" | "title_desc";

export type TestListDbItem = {
    id: string;
    title: string;
    total_questions: number;
    total_disabled?: number;
    is_current_user_creator?: boolean;
};

export type TestListResponse = {
    data: TestListDbItem[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
};

export type TestListItem = {
    id: string;
    title: string;
    questionCount: number;
    disabledCount: number;
    link: string;
};
