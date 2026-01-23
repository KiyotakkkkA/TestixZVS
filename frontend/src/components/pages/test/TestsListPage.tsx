import { Icon } from "@iconify/react"

import { TESTS } from "../../../tests"
import { Button } from "../../atoms"
import { TestListElementCard } from "../../molecules/cards"
import { authStore } from "../../../stores/authStore"

export const TestsListPage = () => {
    return (
        <div className="w-full my-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
                { authStore.hasPermission('create tests') && (
                    <Button
                        to="/workbench/test"
                        className="border-dashed border-2 border-indigo-600 p-5 items-center justify-center flex flex-col text-indigo-600 hover:bg-indigo-50"
                    >
                        <Icon icon='mdi:add-circle-outline' className="w-10 h-10 text-indigo-600" />
                    </Button>
                )}
                { TESTS.map((test, index) => (
                    <TestListElementCard key={index} test={test} />
                )) }
            </div>
        </div>
    )
}