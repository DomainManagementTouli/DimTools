// nav-box.js - Comprehensive Navigation Menu
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const navHTML = `
    <style>
        .dimtools-nav {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        }

        .nav-toggle {
            background: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #8b4513;
            cursor: pointer;
            font-weight: bold;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }

        .nav-toggle:hover {
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }

        .nav-menu {
            position: absolute;
            top: 60px;
            left: 0;
            background: white;
            border-radius: 5px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border: 2px solid #8b4513;
            min-width: 280px;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: all 0.3s ease;
        }

        .nav-menu.active {
            max-height: 600px;
            opacity: 1;
        }

        .nav-menu-inner {
            padding: 10px 0;
        }

        .nav-section {
            margin-bottom: 5px;
        }

        .nav-section-title {
            padding: 8px 16px;
            font-size: 11px;
            font-weight: bold;
            color: #8b4513;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5decf;
        }

        .nav-item {
            display: block;
            padding: 10px 16px;
            color: #333;
            text-decoration: none;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: #f9f5eb;
            border-left-color: #8b4513;
            padding-left: 20px;
        }

        .nav-item.active {
            background: #f6eee3;
            border-left-color: #8b4513;
            font-weight: bold;
            color: #8b4513;
        }

        .nav-hamburger {
            display: inline-block;
            width: 20px;
            height: 14px;
            position: relative;
        }

        .nav-hamburger span {
            display: block;
            position: absolute;
            height: 2px;
            width: 100%;
            background: #8b4513;
            border-radius: 2px;
            opacity: 1;
            left: 0;
            transform: rotate(0deg);
            transition: .25s ease-in-out;
        }

        .nav-hamburger span:nth-child(1) {
            top: 0px;
        }

        .nav-hamburger span:nth-child(2) {
            top: 6px;
        }

        .nav-hamburger span:nth-child(3) {
            top: 12px;
        }

        @media (max-width: 768px) {
            .dimtools-nav {
                top: 10px;
                left: 10px;
            }

            .nav-menu {
                max-width: calc(100vw - 40px);
            }
        }
    </style>

    <nav class="dimtools-nav">
        <div class="nav-toggle" onclick="toggleNav()">
            <div class="nav-hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>DimTools Menu</span>
        </div>
        <div class="nav-menu" id="navMenu">
            <div class="nav-menu-inner">
                <div class="nav-section">
                    <div class="nav-section-title">Main</div>
                    <a href="index.html" class="nav-item ${currentPage === 'index.html' ? 'active' : ''}">🏠 Home</a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">CSV Tools</div>
                    <a href="csvmatcher.html" class="nav-item ${currentPage === 'csvmatcher.html' ? 'active' : ''}">🔍 CSV Relationship Finder</a>
                    <a href="titlecontrolcsvmatcher.html" class="nav-item ${currentPage === 'titlecontrolcsvmatcher.html' ? 'active' : ''}">🔗 CSV Relationships (New)</a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Excel Tools</div>
                    <a href="xlsxviewer.html" class="nav-item ${currentPage === 'xlsxviewer.html' ? 'active' : ''}">📊 XLSX Viewer</a>
                    <a href="xlsxmatcher.html" class="nav-item ${currentPage === 'xlsxmatcher.html' ? 'active' : ''}">🔎 XLSX Relationship Finder</a>
                    <a href="xlsx2csvconverter.html" class="nav-item ${currentPage === 'xlsx2csvconverter.html' ? 'active' : ''}">🔄 XLSX to CSV Converter</a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Other Tools</div>
                    <a href="pdfmerger.html" class="nav-item ${currentPage === 'pdfmerger.html' ? 'active' : ''}">📕 PDF Merger</a>
                    <a href="tomorrowunfed.html" class="nav-item ${currentPage === 'tomorrowunfed.html' ? 'active' : ''}">🍽️ Tomorrow's Unfed Count</a>
                    <a href="livetimesheet.html" class="nav-item ${currentPage === 'livetimesheet.html' ? 'active' : ''}">⏰ Live Timesheet</a>
                </div>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
});

function toggleNav() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.querySelector('.dimtools-nav');
    const navMenu = document.getElementById('navMenu');
    if (nav && navMenu && !nav.contains(event.target)) {
        navMenu.classList.remove('active');
    }
});
