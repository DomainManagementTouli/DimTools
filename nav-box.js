// Compact navigation menu for all pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const navHTML = `
    <div style="position: fixed; top: 15px; left: 15px; z-index: 9999;">
        <div id="navToggle" style="
            width: 44px;
            height: 44px;
            background: white;
            border: 2px solid #1a3c8b;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.2s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <div style="width: 18px; height: 14px; position: relative;">
                <div style="position: absolute; width: 100%; height: 2px; background: #1a3c8b; top: 0;"></div>
                <div style="position: absolute; width: 100%; height: 2px; background: #1a3c8b; top: 6px;"></div>
                <div style="position: absolute; width: 100%; height: 2px; background: #1a3c8b; top: 12px;"></div>
            </div>
        </div>
        <div id="navMenu" style="
            display: none;
            position: absolute;
            top: 52px;
            left: 0;
            background: white;
            border: 2px solid #1a3c8b;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            min-width: 220px;
            padding: 8px 0;
        ">
            <a href="/index.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'index.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'index.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'index.html') this.style.background='white'">🏠 Home</a>          

            <div style="padding: 6px 12px; font-size: 10px; font-weight: 700; color: #1a3c8b; text-transform: uppercase; margin-top: 4px;">Call Center Tools</div>
            <a href="/tomorrowunfed.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'tomorrowunfed.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'tomorrowunfed.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'tomorrowunfed.html') this.style.background='white'">Unfed Count</a>
            <a href="/xlsxviewer.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'xlsxviewer.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'xlsxviewer.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'xlsxviewer.html') this.style.background='white'">XLSX Viewer</a>
            <a href="/livetimesheet.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'livetimesheet.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'livetimesheet.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'livetimesheet.html') this.style.background='white'">Live Timesheet</a>
            <a href="/menutally.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'menutally.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'menutally.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'menutally.html') this.style.background='white'">Menu Tally & Noteboard</a>

            <div style="padding: 6px 12px; font-size: 10px; font-weight: 700; color: #1a3c8b; text-transform: uppercase; margin-top: 4px;">Spreadsheet Tools</div>
            <a href="/csvmatcher.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'csvmatcher.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'csvmatcher.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'csvmatcher.html') this.style.background='white'">CSV Matcher</a>
            <a href="/titlecontrolcsvmatcher.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'titlecontrolcsvmatcher.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'titlecontrolcsvmatcher.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'titlecontrolcsvmatcher.html') this.style.background='white'">CSV Matcher (New)</a>
            <a href="/xlsxmatcher.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'xlsxmatcher.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'xlsxmatcher.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'xlsxmatcher.html') this.style.background='white'">XLSX Matcher</a>
            <a href="/xlsx2csvconverter.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'xlsx2csvconverter.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'xlsx2csvconverter.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'xlsx2csvconverter.html') this.style.background='white'">XLSX to CSV</a>

            <div style="padding: 6px 12px; font-size: 10px; font-weight: 700; color: #1a3c8b; text-transform: uppercase; margin-top: 4px;">Other Tools</div>
            <a href="/pdfmerger.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'pdfmerger.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'pdfmerger.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'pdfmerger.html') this.style.background='white'">PDF Merger</a>
            <a href="texteditor.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'texteditor.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'texteditor.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'texteditor.html') this.style.background='white'">Rich Text Editor</a>
            <a href="/account.html" style="display: block; padding: 8px 12px; color: #333; text-decoration: none; ${currentPage === 'account.html' ? 'background: #e8edf6; font-weight: 600; color: #1a3c8b;' : ''}" onmouseover="if('${currentPage}' !== 'account.html') this.style.background='#edf0f9'" onmouseout="if('${currentPage}' !== 'account.html') this.style.background='white'">My Account</a>

    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Toggle menu
    document.getElementById('navToggle').addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = document.getElementById('navMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('navMenu');
        if (menu && !e.target.closest('#navToggle') && !e.target.closest('#navMenu')) {
            menu.style.display = 'none';
        }
    });
});
