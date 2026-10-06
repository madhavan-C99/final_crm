import CourseAvailabilityTable from "@/apps/telecalling/components/dashboard/CourseAvailabilityTable";
import DashboardBottomCards from "@/apps/telecalling/components/dashboard/DashboardBottomCards";
import { DashboardsCards } from "@/apps/telecalling/components/dashboard/DashboardsCards";
import EnrollmentByCourseCard from "@/apps/telecalling/components/dashboard/EnrollmentByCourseCard";
import LossAnalysisCard from "@/apps/telecalling/components/dashboard/LossAnalysisCard";
import PerformanceCard from "@/apps/telecalling/components/dashboard/PerformanceCard";
import PipelineChart from "@/apps/telecalling/components/dashboard/PipelineChart";
import MainLayout from "@/apps/telecalling/layouts/MainLayout";
function Dashboard() {

    return (
        <>
            <DashboardsCards />
            <CourseAvailabilityTable />
            <PipelineChart />
            <DashboardBottomCards />
        </>
    );
}

export default Dashboard;