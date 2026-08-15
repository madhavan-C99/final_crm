import React from "react";

/**
 * Off-screen template rendered purely for html2canvas capture.
 * Styled to match the NeoDove weekly-report PDF (purple header,
 * pink accents, light-gray stat cards, purple table header, bottom bar).
 *
 * Pass the raw response.data.data object from dashboardExportJsonData here.
 */
const colors = {
    purple: "#90D916",
    pink: "#710dc9",
    lightBg: "#F5F6F8",
    tableHeaderBg: "#5B2A86",
    tableAltRow: "#FAFAFA",
    green: "#23B26D",
    textDark: "#222",
    textGray: "#666",
};

const ExportPdfTemplate = React.forwardRef(({ data, orgName, weekLabel }, ref) => {
    if (!data) return null;

    const {
        generated_for,
        role,
        date_filter_label,
        stats_cards = [],
        pipeline,
        performance,
        enrollment_by_courses = [],
        loss_analysis,
    } = data;

    return (
        <div
            ref={ref}
            style={{
                width: "800px",
                fontFamily: "Arial, sans-serif",
                background: "#FFFFFF",
                padding: "32px",
                color: colors.textDark,
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ color: colors.purple, fontSize: "28px", margin: 0 }}>
                        Dashboard Report
                    </h1>
                </div>

            </div>

            <div style={{ marginTop: "16px", fontSize: "14px" }}>
                <div>
                    <strong>Organisation Name : </strong>
                    <span style={{ color: colors.pink }}>{orgName}</span>

                </div>
                <div style={{ marginTop: "6px" }}>
                    <strong>Filter : </strong>
                    <span style={{ color: colors.pink }}>
                        {date_filter_label || weekLabel}
                    </span>
                </div>
                <div style={{ marginTop: "10px" }}>
                    Hey there <span style={{ color: colors.purple }}>{generated_for} ({role})</span>,
                </div>
                <div style={{ marginTop: "4px", color: colors.textGray }}>
                    Please review your report for an overview of the latest updates and insights
                    related to your account!
                </div>
            </div>

            {/* STATS CARDS */}
            <div
                style={{
                    marginTop: "24px",
                    background: colors.lightBg,
                    borderRadius: "8px",
                    padding: "20px",
                }}
            >
                <div style={{ textAlign: "center", fontSize: "18px", fontWeight: 700 }}>
                    Performance Overview
                </div>
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: colors.pink,
                        marginTop: "4px",
                        marginBottom: "16px",
                    }}
                >
                    Here is an overview of your team's performance
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px",
                    }}
                >
                    {stats_cards.map((card, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", color: colors.textGray }}>
                                {card.label}
                            </div>
                            <div
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: colors.purple,
                                    marginTop: "4px",
                                }}
                            >
                                {card.label === "Pending Payments" ? `₹ ${card.value}` : card.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PIPELINE / FUNNEL */}
            {pipeline?.funnel?.length > 0 && (
                <div
                    style={{
                        marginTop: "20px",
                        background: colors.lightBg,
                        borderRadius: "8px",
                        padding: "20px",
                    }}
                >
                    <div style={{ textAlign: "center", fontSize: "18px", fontWeight: 700 }}>
                        Lead Pipeline
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            fontSize: "12px",
                            color: colors.pink,
                            marginTop: "4px",
                            marginBottom: "16px",
                        }}
                    >
                        Stage-wise breakdown of leads
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <tbody>
                            {pipeline.funnel.map((stage, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid #E4E4E4" }}>
                                    <td style={{ padding: "6px 4px" }}>{stage.name}</td>
                                    <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700 }}>
                                        {stage.value}
                                    </td>
                                    <td style={{ padding: "6px 4px", textAlign: "right", color: colors.textGray }}>
                                        {stage.percentage}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PERFORMANCE SUMMARY */}
            {performance && (
                <div style={{ marginTop: "24px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
                        Team Performance
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ background: colors.tableHeaderBg, color: "#FFF" }}>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Role</th>
                                <th style={thStyle}>Total Leads</th>
                                <th style={thStyle}>Contacted</th>
                                <th style={thStyle}>Won</th>
                                <th style={thStyle}>Lost</th>
                                <th style={thStyle}>Contact Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={tdStyle}>
                                    {performance.first_name} {performance.last_name}
                                </td>
                                <td style={tdStyle}>{performance.role_name}</td>
                                <td style={tdStyle}>{performance.total_leads}</td>
                                <td style={tdStyle}>{performance.contacted}</td>
                                <td style={tdStyle}>{performance.won_leads}</td>
                                <td style={tdStyle}>{performance.lost_leads}</td>
                                <td style={tdStyle}>{performance.contact_rate}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ENROLLMENT BY COURSES */}
            {enrollment_by_courses?.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
                        Enrollment by Courses
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ background: colors.tableHeaderBg, color: "#FFF" }}>
                                <th style={thStyle}>Course</th>
                                <th style={thStyle}>Count</th>
                                <th style={thStyle}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollment_by_courses.map((c, i) => (
                                <tr key={i} style={{ background: i % 2 ? colors.tableAltRow : "#FFF" }}>
                                    <td style={tdStyle}>{c.label}</td>
                                    <td style={tdStyle}>{c.value}</td>
                                    <td style={tdStyle}>{c.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* LOSS ANALYSIS */}
            {loss_analysis?.reasons?.length > 0 && (
                <div style={{ marginTop: "54px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
                        Loss Analysis (Total Lost: {loss_analysis.total_lost})
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ background: colors.tableHeaderBg, color: "#FFF" }}>
                                <th style={thStyle}>Reason</th>
                                <th style={thStyle}>Count</th>
                                <th style={thStyle}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loss_analysis.reasons.map((r, i) => (
                                <tr key={i} style={{ background: i % 2 ? colors.tableAltRow : "#FFF" }}>
                                    <td style={tdStyle}>{r.label}</td>
                                    <td style={tdStyle}>{r.value}</td>
                                    <td style={tdStyle}>{r.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* FOOTER BAR */}
            <div style={{ display: "flex", marginTop: "32px" }}>
                <div style={{ flex: 1, height: "10px", background: colors.purple }} />
                <div style={{ flex: 1, height: "10px", background: colors.pink }} />
            </div>
        </div>
    );
});

const thStyle = {
    padding: "8px 6px",
    textAlign: "left",
    fontWeight: 600,
};

const tdStyle = {
    padding: "8px 6px",
    borderBottom: "1px solid #EEE",
};

export default ExportPdfTemplate;
