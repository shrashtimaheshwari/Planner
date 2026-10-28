import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from schemas import ItineraryResponse

def generate_itinerary_pdf(itinerary: ItineraryResponse) -> io.BytesIO:
    """Generates a polished, downloadable travel itinerary PDF using ReportLab"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    PRIMARY = colors.HexColor("#0284c7")     # Sky Blue
    DARK_TEXT = colors.HexColor("#0f172a")   # Slate 900
    MUTED_TEXT = colors.HexColor("#475569")  # Slate 600
    BG_LIGHT = colors.HexColor("#f8fafc")    # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=MUTED_TEXT,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=DARK_TEXT,
        spaceBefore=12,
        spaceAfter=8
    )

    day_header_style = ParagraphStyle(
        'DayHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT
    )

    bold_label = ParagraphStyle(
        'BoldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT
    )

    story = []

    # Title & Subtitle Header
    story.append(Paragraph(itinerary.title, title_style))
    meta_info = f"Destination: <b>{itinerary.destination}</b> | Dates: <b>{itinerary.start_date}</b> to <b>{itinerary.end_date}</b> ({itinerary.total_days} Days)"
    story.append(Paragraph(meta_info, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=4, spaceAfter=12))

    # Summary Stats Table
    summary_data = [
        [
            Paragraph("<b>Total Budget</b>", bold_label),
            Paragraph(f"{itinerary.budget:,.2f} {itinerary.currency}", body_style),
            Paragraph("<b>Estimated Expense</b>", bold_label),
            Paragraph(f"{itinerary.estimated_total_cost:,.2f} {itinerary.currency}", body_style),
        ],
        [
            Paragraph("<b>Travelers</b>", bold_label),
            Paragraph(f"{itinerary.travelers_count} ({itinerary.traveler_type})", body_style),
            Paragraph("<b>Travel Vibe</b>", bold_label),
            Paragraph(itinerary.vibe.capitalize(), body_style),
        ]
    ]
    summary_table = Table(summary_data, colWidths=[110, 150, 120, 150])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # Day by Day Itinerary
    story.append(Paragraph("Day-by-Day Schedule", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=2, spaceAfter=10))

    for day in itinerary.days:
        day_flowables = []
        
        # Day Header banner
        theme_txt = f" - <i>{day.theme}</i>" if day.theme else ""
        day_title = f"Day {day.day_number} ({day.date}){theme_txt}"
        day_flowables.append(Paragraph(day_title, day_header_style))
        day_flowables.append(Spacer(1, 4))

        if day.accommodation_suggestion:
            day_flowables.append(Paragraph(f"<b>Accommodation:</b> {day.accommodation_suggestion}", body_style))
            day_flowables.append(Spacer(1, 4))

        # Activities Table
        act_rows = [[
            Paragraph("<b>Time</b>", bold_label),
            Paragraph("<b>Activity & Details</b>", bold_label),
            Paragraph("<b>Transit & Dining</b>", bold_label),
            Paragraph("<b>Est. Cost</b>", bold_label),
        ]]

        for act in day.activities:
            desc_text = f"<b>{act.title}</b><br/>{act.description}"
            if act.notes:
                desc_text += f"<br/><font color='#0284c7'>Tip: {act.notes}</font>"

            logistics_parts = []
            if act.transport_tip:
                logistics_parts.append(f"Transit: {act.transport_tip}")
            if act.dining_recommendation:
                logistics_parts.append(f"Dining: {act.dining_recommendation}")
            logistics_text = "<br/>".join(logistics_parts) if logistics_parts else "-"

            cost_text = f"{act.estimated_cost:.1f} {itinerary.currency}"

            act_rows.append([
                Paragraph(f"{act.time}<br/><font color='#64748b'>({act.period.capitalize()})</font>", body_style),
                Paragraph(desc_text, body_style),
                Paragraph(logistics_text, body_style),
                Paragraph(cost_text, body_style)
            ])

        act_table = Table(act_rows, colWidths=[90, 230, 150, 60])
        act_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))

        day_flowables.append(act_table)
        day_flowables.append(Spacer(1, 4))
        day_flowables.append(Paragraph(f"<b>Estimated Daily Total:</b> {day.estimated_daily_cost:,.2f} {itinerary.currency}", body_style))
        day_flowables.append(Spacer(1, 14))

        story.append(KeepTogether(day_flowables))

    # Planning Tips Section
    if itinerary.planning_tips:
        tips_flowables = [
            Paragraph("Useful Planning Tips & Recommendations", h1_style),
            HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=2, spaceAfter=8)
        ]
        for tip in itinerary.planning_tips:
            tips_flowables.append(Paragraph(f"• {tip}", body_style))
            tips_flowables.append(Spacer(1, 3))
        
        tips_flowables.append(Spacer(1, 10))
        tips_flowables.append(Paragraph("<i>Note: All schedules, opening hours, transit routes, and costs are curated estimates. Verify local conditions prior to departure.</i>", ParagraphStyle('Discl', parent=body_style, textColor=MUTED_TEXT, fontSize=8)))
        story.append(KeepTogether(tips_flowables))

    doc.build(story)
    buffer.seek(0)
    return buffer
