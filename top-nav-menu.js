// top-nav-menu.js
// Navigation menu for GitHub Pages site
// Add to any page with: <script src="top-nav-menu.js"></script>

(function() {
    'use strict';

    // Menu configuration based on your requirements
    const menuConfig = [
        // Home - standalone link
        {
            type: 'link',
            text: 'Home',
            href: 'index.html'
        },
        // XLSX Local Browser Viewer - standalone link
        {
            type: 'link',
            text: 'XLSX Local Browser Viewer',
            href: 'xlsxviewer.html'
        },
        // Unfed Breakfast & Lunch - standalone link
        {
            type: 'link',
            text: 'Unfed Breakfast & Lunch: Counter & Printable Form',
            href: 'tomorrowunfed.html'
        },
        // Spreadsheet Interaction - dropdown with [[text]]
        {
            type: 'dropdown',
            text: 'Spreadsheet Interaction',
            items: [
                { text: 'XLSX Cell Relationship Finder', href: 'xlsxmatcher.html' },
                { text: 'CSV Cell Relationship Finder', href: 'csvmatcher.html' },
                { text: '(beta)Variable Row Title Column RF', href: 'titlecontrolcsvmatcher.html' }
            ]
        },
        // Convert - dropdown with [[text]]
        {
            type: 'dropdown',
            text: 'Convert',
            items: [
                { text: 'Convert XLSX to CSV', href: 'xlsx2csvconverter.html' },
                { text: 'Secure PDF Merger', href: 'pdfmerger.html' }
            ]
        }
    ];

    // Generate menu HTML
    function generateMenuHTML() {
        // SVG for dropdown arrow
        const arrowSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-left: 5px;">
                <path d="M4 6 L8 10 L12 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
        `;

        let menuHTML = `
        <nav class="top-nav-menu">
            <div class="nav-container">
                <ul class="nav-list">
        `;

        menuConfig.forEach(item => {
            if (item.type === 'link') {
                // Standalone link
                menuHTML += `
                    <li class="nav-item">
                        <a href="${item.href}" class="nav-link">${item.text}</a>
                    </li>
                `;
            } else if (item.type === 'dropdown') {
                // Dropdown menu with [[text]]
                menuHTML += `
                    <li class="nav-item dropdown">
                        <a href="#" class="nav-link dropdown-toggle">
                            ${item.text}
                            ${arrowSVG}
                        </a>
                        <ul class="dropdown-menu">
                `;
                
                // Add dropdown items
                item.items.forEach(subItem => {
                    menuHTML += `
                            <li><a href="${subItem.href}">${subItem.text}</a></li>
                    `;
                });
                
                menuHTML += `
                        </ul>
                    </li>
                `;
            }
        });

        menuHTML += `
                </ul>
            </div>
        </nav>
        `;

        return menuHTML;
    }

    // Create menu styles
    const menuStyles = `
        <style>
            /* Top Navigation Menu */
            .top-nav-menu {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                position: sticky;
                top: 0;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }

            .nav-list {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
                align-items: center;
            }

            .nav-item {
                position: relative;
            }

            .nav-link {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                color: white;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                border-bottom: 3px solid transparent;
                white-space: nowrap;
            }

            .nav-link:hover {
                background: rgba(255, 255, 255, 0.1);
                border-bottom-color: #3498db;
            }

            .nav-link:focus {
                outline: 2px solid #3498db;
                outline-offset: -2px;
            }

            /* Current page highlighting */
            .nav-item.current .nav-link {
                background: rgba(52, 152, 219, 0.2);
                border-bottom-color: #3498db;
                font-weight: 600;
            }

            /* Dropdown styles */
            .dropdown-toggle {
                position: relative;
            }

            .dropdown-toggle svg {
                transition: transform 0.3s ease;
            }

            .dropdown.active .dropdown-toggle svg {
                transform: rotate(180deg);
            }

            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                min-width: 220px;
                border-radius: 4px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                list-style: none;
                margin: 0;
                padding: 10px 0;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1001;
            }

            .dropdown.active .dropdown-menu,
            .dropdown:hover .dropdown-menu {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .dropdown-menu li {
                margin: 0;
            }

            .dropdown-menu a {
                display: block;
                padding: 10px 20px;
                color: #2c3e50;
                text-decoration: none;
                transition: all 0.2s ease;
                border-left: 3px solid transparent;
            }

            .dropdown-menu a:hover {
                background: #f8f9fa;
                color: #3498db;
                border-left-color: #3498db;
            }

            .dropdown-menu a:focus {
                outline: 2px solid #3498db;
                outline-offset: -2px;
            }

            /* Mobile responsive styles */
            @media (max-width: 768px) {
                .nav-list {
                    flex-direction: column;
                    align-items: stretch;
                }

                .nav-link {
                    padding: 12px 20px;
                    justify-content: space-between;
                }

                .dropdown-menu {
                    position: static;
                    opacity: 1;
                    visibility: visible;
                    transform: none;
                    display: none;
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: none;
                    border-radius: 0;
                    padding: 0;
                }

                .dropdown.active .dropdown-menu {
                    display: block;
                }

                .dropdown-menu a {
                    padding: 10px 20px 10px 40px;
                    color: rgba(255, 255, 255, 0.9);
                    border-left: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .dropdown-menu a:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
            }

            /* Logo/Brand area (optional) */
            .nav-brand {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                margin-right: auto;
                font-weight: bold;
                font-size: 1.2em;
                color: white;
                text-decoration: none;
            }

            .nav-brand:hover {
                color: #3498db;
            }

            /* Mobile menu toggle (for small screens) */
            .menu-toggle {
                display: none;
                background: none;
                border: none;
                color: white;
                font-size: 1.5em;
                cursor: pointer;
                padding: 10px;
            }

            @media (max-width: 768px) {
                .menu-toggle {
                    display: block;
                }

                .nav-list {
                    display: none;
                }

                .nav-list.active {
                    display: flex;
                }
            }
        </style>
    `;

    // Function to initialize the menu
    function initNavigationMenu() {
        // Add styles to head
        document.head.insertAdjacentHTML('beforeend', menuStyles);

        // Generate and insert menu HTML
        const menuHTML = generateMenuHTML();
        document.body.insertAdjacentHTML('afterbegin', menuHTML);

        // Highlight current page
        highlightCurrentPage();

        // Add mobile menu toggle functionality
        addMobileMenuToggle();

        // Add dropdown click functionality for mobile
        addDropdownFunctionality();
    }

    // Function to highlight current page
    function highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Check if this link matches the current page
            if (href === currentPath || 
                (currentPath === '' && href === 'index.html') ||
                (currentPath === 'index.html' && href === 'index.html')) {
                link.parentElement.classList.add('current');
            }
        });
    }

    // Function to add mobile menu toggle
    function addMobileMenuToggle() {
        // Create mobile menu toggle button
        const toggleHTML = `
            <button class="menu-toggle" aria-label="Toggle menu">
                ☰
            </button>
        `;
        
        const navContainer = document.querySelector('.nav-container');
        navContainer.insertAdjacentHTML('afterbegin', toggleHTML);
        
        const menuToggle = document.querySelector('.menu-toggle');
        const navList = document.querySelector('.nav-list');
        
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuToggle.textContent = navList.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Function to add dropdown click functionality (for mobile)
    function addDropdownFunctionality() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = toggle.parentElement;
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            otherToggle.parentElement.classList.remove('active');
                        }
                    });
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.dropdown')) {
                    document.querySelectorAll('.dropdown').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigationMenu);
    } else {
        initNavigationMenu();
    }

})();
