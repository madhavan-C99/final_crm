import React from 'react'
import MainLayout from '@/apps/telecalling/layouts/MainLayout'
import DailyReportHeader from '@/apps/telecalling/components/dailyReport/DailyReportHeader'
import DailyReportCards from '@/apps/telecalling/components/dailyReport/DailyReportCards'

export const DailyReport = () => {
    return (
        <>
            <DailyReportHeader />
            <DailyReportCards />
        </>
    )
}
