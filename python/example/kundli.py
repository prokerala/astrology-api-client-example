import os
import webbrowser
from jinja2 import Environment, FileSystemLoader
from prokerala_api import ApiClient
from datetime import datetime

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"

def date_format(value, format="%B %d, %Y %H:%M:%S"):
    date_obj = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return date_obj.strftime(format)

def zodiac_icon(zodiac_name):
    zodiac_icons = {
        "Aries": "&#9800;",
        "Taurus": "&#9801;",
        "Gemini": "&#9802;",
        "Cancer": "&#9803;",
        "Leo": "&#9804;",
        "Virgo": "&#9805;",
        "Libra": "&#9806;",
        "Scorpio": "&#9807;",
        "Sagittarius": "&#9808;",
        "Capricorn": "&#9809;",
        "Aquarius": "&#9810;",
        "Pisces": "&#9811;"
    }
    return zodiac_icons.get(zodiac_name, "")

def run():
    client_id = os.getenv('PROKERALA_CLIENT_ID', 'YOUR_CLIENT_ID')
    client_secret = os.getenv('PROKERALA_CLIENT_SECRET', 'YOUR_CLIENT_SECRET')

    client = ApiClient(client_id, client_secret)
    result = client.get('v2/astrology/kundli/advanced', {
        'ayanamsa': 1,
        'coordinates': '23.1765,75.7885',
        'datetime': '2020-10-19T12:31:14+00:00'
    })
    # Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader('.'))
    env.filters['date_format'] = date_format
    env.filters['zodiac_icon'] = zodiac_icon

    template = env.get_template('template.html.j2')

    # Render the template with the data
    html_output = template.render(data=result['data'])

    # Save the rendered HTML to a file
    output_file = 'astrology_report.html'
    with open(output_file, 'w') as f:
        f.write(html_output)

    print("Report generated: astrology_report.html")

    # Open the generated HTML file in the default web browser
    webbrowser.open(output_file)

if __name__ == '__main__':
    run()

