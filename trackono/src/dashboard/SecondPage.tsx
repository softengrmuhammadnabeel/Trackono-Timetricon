// import { ChartAreaInteractive } from "@/app/(examples)/dashboard/components/chart-area-interactive"
// import { DataTable } from "@/app/(examples)/dashboard/components/data-table"
import { SectionCards } from "@/components/dashboard-components/SectionCards"
import { Link } from "react-router-dom"
// import data from "@/app/(examples)/dashboard/data.json"

export default function DashboardSecondPage() {
    return (
        <div className="@container/main flex flex-1 overflow-auto flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                CLI
                <div className="px-4 lg:px-6">
                    <SectionCards />
                    {/* <ChartAreaInteractive /> */}
                </div>
                {/* <DataTable data={data} /> */}
            </div>
        </div>
    )
}

