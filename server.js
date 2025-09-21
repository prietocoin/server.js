const http = require('http');
const { google } = require('googleapis');

// 1. Configura tus credenciales de Google
// Reemplaza 'TU_API_KEY' con tu clave de API real de Google Cloud.
const sheets = google.sheets({ version: 'v4', auth: 'AIzaSyCsiHI3Yjkq-FcRo6wZWg5S5h87RLzKAt0' });

// 2. Configura el ID de tu hoja de cálculo
const spreadsheetId = '1_7nHZBxsqt7FQJ5CYs79KoJl8DZEck7tLYI0KgSArDc';

// 3. Define los rangos de tus 10 tablas
const ranges = [
    'Hoja1!A1:C12', 'Hoja1!E1:G12', 'Hoja1!A14:C25', 'Hoja1!E14:G25', 'Hoja1!A27:C38',
    'Hoja1!E27:G38', 'Hoja1!A40:C51', 'Hoja1!E40:G51', 'Hoja1!A53:C64', 'Hoja1!E53:G64'
];

async function getTableDataFromSheet() {
    const tablesData = [];

    for (const range of ranges) {
        try {
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            tablesData.push(res.data.values);
        } catch (error) {
            console.error('Error al obtener datos de Google Sheets:', error);
            tablesData.push([]);
        }
    }
    return tablesData;
}

const server = http.createServer(async (req, res) => {
    // Obtenemos los datos de las 10 tablas de Google Sheets
    const tablesData = await getTableDataFromSheet();

    // Generamos el HTML para cada tabla, dentro de un div con un ID único
    const htmlTables = tablesData.map((table, index) => {
        if (!table || table.length === 0) {
            return `<div id="tabla-${index + 1}"><h2>Tabla ${index + 1}</h2><p>No hay datos disponibles.</p></div>`;
        }

        const headers = table[0];
        const rows = table.slice(1);
        
        const tableRows = rows.map(row => `
            <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
        `).join('');

        const tableHeaders = headers.map(header => `<th>${header}</th>`).join('');

        return `
            <div id="tabla-${index + 1}">
                <h2>Tabla ${index + 1}</h2>
                <table>
                    <thead>
                        <tr>${tableHeaders}</tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');

    // Creamos la página web completa
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Tablas Dinámicas</title>
        <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            div[id^="tabla-"] { padding: 10px; margin: 10px; border: 1px solid #ccc; }
        </style>
    </head>
    <body>
        <h1>Reporte de Pagos Dinámicos</h1>
        ${htmlTables}
    </body>
    </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fullHtml);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
