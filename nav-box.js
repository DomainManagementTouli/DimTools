// nav-box.js - Compact Professional Navigation
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const navHTML = `
    <style>
        .dimtools-nav {
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 9999;
        }

        .nav-toggle {
            width: 44px;
            height: 44px;
            background: white;
            border: 2px solid #8b4513;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }

        .nav-toggle:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: scale(1.05);
        }

        .nav-hamburger {
            width: 18px;
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
            left: 0;
            transition: 0.25s ease;
        }

        .nav-hamburger span:nth-child(1) { top: 0; }
        .nav-hamburger span:nth-child(2) { top: 6px; }
        .nav-hamburger span:nth-child(3) { top: 12px; }

        .nav-menu {
            position: absolute;
            top: 52px;
            left: 0;
            background: white;
            border: 2px solid #8b4513;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            min-width: 240px;
            display: none;
        }

        .nav-menu.active {
            display: block;
        }

        .nav-menu-inner {
            padding: 4px 0;
        }

        .nav-section-title {
            padding: 6px 12px 4px 12px;
            font-size: 10px;
            font-weight: 700;
            color: #8b4513;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }

        .nav-section-title:first-child {
            margin-top: 0;
        }

        .nav-item {
            display: block;
            padding: 8px 12px;
            color: #333;
            text-decoration: none;
            font-size: 14px;
            transition: background 0.15s ease;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: #f9f5eb;
            border-left-color: #8b4513;
        }

        .nav-item.active {
            background: #f6eee3;
            border-left-color: #8b4513;
            font-weight: 600;
            color: #8b4513;
        }

        @media (max-width: 768px) {
            .dimtools-nav {
                top: 10px;
                left: 10px;
            }
            .nav-menu {
                max-width: calc(100vw - 30px);
            }
        }
    </style>

    <nav class="dimtools-nav">
        <div class="nav-toggle" onclick="toggleNav(event)">
            <div class="nav-hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div class="nav-menu" id="navMenu">
            <div class="nav-menu-inner">
                <div class="nav-section-title">Main</div>
                <a href="index.html" class="nav-item ${currentPage === 'index.html' ? 'active' : ''}">🏠 Home</a>

                <div class="nav-section-title">CSV Tools</div>
                <a href="csvmatcher.html" class="nav-item ${currentPage === 'csvmatcher.html' ? 'active' : ''}">CSV Matcher</a>
                <a href="titlecontrolcsvmatcher.html" class="nav-item ${currentPage === 'titlecontrolcsvmatcher.html' ? 'active' : ''}">CSV Matcher (New)</a>

                <div class="nav-section-title">Excel Tools</div>
                <a href="xlsxviewer.html" class="nav-item ${currentPage === 'xlsxviewer.html' ? 'active' : ''}">XLSX Viewer</a>
                <a href="xlsxmatcher.html" class="nav-item ${currentPage === 'xlsxmatcher.html' ? 'active' : ''}">XLSX Matcher</a>
                <a href="xlsx2csvconverter.html" class="nav-item ${currentPage === 'xlsx2csvconverter.html' ? 'active' : ''}">XLSX to CSV</a>

                <div class="nav-section-title">Other</div>
                <a href="pdfmerger.html" class="nav-item ${currentPage === 'pdfmerger.html' ? 'active' : ''}">PDF Merger</a>
                <a href="tomorrowunfed.html" class="nav-item ${currentPage === 'tomorrowunfed.html' ? 'active' : ''}">Unfed Count</a>
                <a href="livetimesheet.html" class="nav-item ${currentPage === 'livetimesheet.html' ? 'active' : ''}">Live Timesheet</a>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
});

function toggleNav(event) {
    event.stopPropagation();
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.querySelector('.dimtools-nav');
    const navMenu = document.getElementById('navMenu');
    if (navMenu && !nav.contains(event.target)) {
        navMenu.classList.remove('active');
    }
});
