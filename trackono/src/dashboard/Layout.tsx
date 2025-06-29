import { AppSidebar } from "@/components/app-sidebar"
import Switch from "@/components/styled-components/Switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,

} from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
export default function DashboardLayout(
  //     {
  //   children,
  // }: {
  //   children: React.ReactNode
  // }
) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex  h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center  gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Timer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Time Engine</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto pr-5">
            <Switch />
          </div>
        </header>
        <div className="h-screen overflow-auto">
          <div className="flex flex-col min-h-0 gap-4 p-6 pt-0">
            <Outlet />
          </div>
        </div>


      </SidebarInset>
    </SidebarProvider>
  )
}

{/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
  <div className="bg-muted/50 aspect-video rounded-xl" />
  <div className="bg-muted/50 aspect-video rounded-xl" />
  <div className="bg-muted/50 aspect-video rounded-xl" />
</div>
<div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
{/* {children} */ }