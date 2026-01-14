// navigation-menu.js
// Standalone navigation menu for DimTools website
// To use: Add <script src="navigation-menu.js"></script> to your HTML

(function() {
    'use strict';

    // Create navigation menu HTML
    const navigationHTML = `
        <!-- SVG for arrow icon -->
        <svg xmlns="http://www.w3.org/2000/svg" hidden>
            <symbol id="arrow" viewBox="0 0 16 16">
                <polyline points="4 6, 8 10, 12 6" stroke="currentColor" stroke-width="2" fill="transparent" stroke-linecap="round" />
            </symbol>
        </svg>

        <!-- Navigation Menu -->
        <nav id="dimtools-navigation" class="dimtools-navigation" aria-label="DimTools Navigation">
            <ul class="main-menu clicky-menu no-js paper border shadow large-shadow shadow-hover">
                <li class="current">
                    <a href="csvmatcher.html">CSV Row Matcher</a>
                </li>
                <li>
                    <a href="xlsxviewer.html">
                        XLSX Viewer
                        <svg aria-hidden="true" width="16" height="16">
                            <use xlink:href="#arrow" />
                        </svg>
                    </a>
                    <ul>
                        <li><a href="xlsxviewer.html">Basic Viewer</a></li>
                        <li><a href="xlsxviewer.html#advanced">Advanced Features</a></li>
                    </ul>
                </li>
                <li>
                    <a href="xlsxtocsv.html">
                        XLSX to CSV
                        <svg aria-hidden="true" width="16" height="16">
                            <use xlink:href="#arrow" />
                        </svg>
                    </a>
                    <ul>
                        <li><a href="xlsxtocsv.html">Converter</a></li>
                        <li><a href="xlsxtocsv.html#batch">Batch Processing</a></li>
                    </ul>
                </li>
                <li>
                    <a href="about.html">
                        About
                        <svg aria-hidden="true" width="16" height="16">
                            <use xlink:href="#arrow" />
                        </svg>
                    </a>
                    <ul>
                        <li><a href="about.html">What is DimTools?</a></li>
                        <li><a href="about.html#features">Features</a></li>
                        <li><a href="about.html#privacy">Privacy Policy</a></li>
                        <li><button data-clicky-menus-close="dimtools-navigation">Close Menu</button></li>
                    </ul>
                </li>
            </ul>
        </nav>
    `;

    // Create menu styles
    const menuStyles = `
        <style>
            /* Navigation container */
            .dimtools-navigation {
                width: 100%;
                max-width: 1200px;
                margin: 0 auto 2rem;
                background: white;
                border-radius: 5px;
                padding: 0.5rem;
                box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
                position: relative;
                z-index: 1000;
            }

            /* Main menu list */
            .dimtools-navigation .main-menu {
                display: flex;
                gap: 0.5rem;
                margin: 0;
                padding: 0;
                list-style: none;
                justify-content: space-between;
            }

            /* Menu items */
            .dimtools-navigation .main-menu > li {
                position: relative;
                flex: 1;
                text-align: center;
            }

            /* Menu links */
            .dimtools-navigation .main-menu > li > a,
            .dimtools-navigation .main-menu > li > button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                width: 100%;
                padding: 1rem;
                background: transparent;
                color: #8b4513;
                font-family: inherit;
                font-weight: 600;
                text-decoration: none;
                border: 2px solid transparent;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .dimtools-navigation .main-menu > li > a:hover,
            .dimtools-navigation .main-menu > li > button:hover {
                background: #f9f5eb;
                border-color: #e5decf;
            }

            .dimtools-navigation .main-menu > li.current > a {
                background: #8b4513;
                color: white;
                border-color: #8b4513;
            }

            .dimtools-navigation .main-menu > li > a:focus,
            .dimtools-navigation .main-menu > li > button:focus {
                outline: none;
                border-color: #8b4513;
                box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.2);
            }

            /* Arrow icon */
            .dimtools-navigation svg {
                width: 16px;
                height: 16px;
                transition: transform 0.3s ease;
            }

            .dimtools-navigation [aria-expanded="true"] svg {
                transform: rotate(180deg);
            }

            /* Submenus */
            .dimtools-navigation .main-menu ul {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 100%;
                margin: 0.25rem 0 0;
                padding: 0.5rem;
                background: white;
                border: 1px solid #e5decf;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                list-style: none;
                visibility: hidden;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1001;
            }

            .dimtools-navigation .main-menu ul[aria-hidden="false"] {
                visibility: visible;
                opacity: 1;
                transform: translateY(0);
            }

            /* Submenu items */
            .dimtools-navigation .main-menu ul li {
                margin: 0;
            }

            .dimtools-navigation .main-menu ul a,
            .dimtools-navigation .main-menu ul button {
                display: block;
                width: 100%;
                padding: 0.75rem 1rem;
                background: transparent;
                color: #5d4037;
                text-decoration: none;
                border: none;
                border-radius: 3px;
                text-align: left;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.95rem;
                transition: all 0.2s ease;
            }

            .dimtools-navigation .main-menu ul a:hover,
            .dimtools-navigation .main-menu ul button:hover {
                background: #f9f5eb;
                color: #8b4513;
            }

            .dimtools-navigation .main-menu ul button {
                color: #666;
                font-style: italic;
                font-size: 0.9rem;
            }

            /* No-JS fallback */
            .dimtools-navigation .no-js li:hover > ul {
                visibility: visible;
                opacity: 1;
                transform: translateY(0);
            }

            .dimtools-navigation .no-js li:focus-within > ul {
                visibility: visible;
                opacity: 1;
                transform: translateY(0);
            }

            /* Remove no-js class when JS is enabled */
            .dimtools-navigation .main-menu:not(.no-js) {
                /* JS-specific styles if needed */
            }

            /* Responsive styles */
            @media (max-width: 768px) {
                .dimtools-navigation .main-menu {
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .dimtools-navigation .main-menu > li {
                    width: 100%;
                }

                .dimtools-navigation .main-menu ul {
                    position: static;
                    width: 100%;
                    margin: 0.25rem 0;
                    box-shadow: none;
                    border: 1px solid #e5decf;
                    opacity: 1;
                    transform: none;
                    visibility: visible;
                    display: none;
                }

                .dimtools-navigation .main-menu ul[aria-hidden="false"] {
                    display: block;
                }
            }
        </style>
    `;

    // Clicky Menus functionality (adapted from original)
    class ClickyMenus {
        constructor(menu, menuIndex) {
            this.menu = menu;
            this.menuIndex = menuIndex;
            this.container = menu.parentElement;
            this.currentMenuItem = null;
            this.i = 0;
        }

        init() {
            this.menuSetup();
            document.addEventListener('click', (e) => this.closeIfClickOutsideMenu(e));
            this.menu.addEventListener('clickyMenusClose', () => this.closeOpenSubmenu());
        }

        // Menu open/close functions
        toggleOnMenuClick(e) {
            const button = e.currentTarget;

            if (this.currentMenuItem && button !== this.currentMenuItem) {
                this.toggleSubmenu(this.currentMenuItem);
            }

            this.toggleSubmenu(button);
        }

        toggleSubmenu(button) {
            const submenu = document.getElementById(button.getAttribute('aria-controls'));

            if ('true' === button.getAttribute('aria-expanded')) {
                button.setAttribute('aria-expanded', false);
                submenu.setAttribute('aria-hidden', true);
                this.currentMenuItem = false;
            } else {
                button.setAttribute('aria-expanded', true);
                submenu.setAttribute('aria-hidden', false);
                this.preventOffScreenSubmenu(submenu);
                this.currentMenuItem = button;
            }
        }

        preventOffScreenSubmenu(submenu) {
            const screenWidth = window.innerWidth ||
                               document.documentElement.clientWidth ||
                               document.body.clientWidth;
            const parent = submenu.offsetParent;
            const menuLeftEdge = parent.getBoundingClientRect().left;
            const menuRightEdge = menuLeftEdge + submenu.offsetWidth;

            if (menuRightEdge + 32 > screenWidth) {
                submenu.classList.add('sub-menu--right');
            }
        }

        closeOnEscKey(e) {
            if (27 === e.keyCode) {
                if (null !== e.target.closest('ul[aria-hidden="false"]')) {
                    this.currentMenuItem.focus();
                    this.toggleSubmenu(this.currentMenuItem);
                    e.preventDefault();
                } else if ('true' === e.target.getAttribute('aria-expanded')) {
                    this.toggleSubmenu(this.currentMenuItem);
                    e.preventDefault();
                }
            }
        }

        closeIfClickOutsideMenu(e) {
            if (this.currentMenuItem && !e.target.closest('#' + this.container.id)) {
                this.toggleSubmenu(this.currentMenuItem);
            }
        }

        closeOpenSubmenu() {
            if (this.currentMenuItem) {
                this.toggleSubmenu(this.currentMenuItem);
            }
        }

        // Menu setup
        menuSetup() {
            this.menu.classList.remove('no-js');
            const submenuSelector = 'ul';

            this.menu.querySelectorAll(submenuSelector).forEach((submenu, index) => {
                const menuItem = submenu.parentElement;
                const link = menuItem.querySelector('a');

                if (link && link.nextElementSibling === submenu) {
                    const button = this.convertLinkToButton(menuItem, link);
                    this.setUpAria(submenu, button, index);
                    button.addEventListener('click', (e) => this.toggleOnMenuClick(e));
                    this.menu.addEventListener('keydown', (e) => this.closeOnEscKey(e));
                }
            });
        }

        convertLinkToButton(menuItem, link) {
            const linkHTML = link.innerHTML;
            const linkAtts = link.attributes;
            const button = document.createElement('button');

            button.innerHTML = linkHTML.trim();
            for (let i = 0; i < linkAtts.length; i++) {
                const attr = linkAtts[i];
                if (attr.name !== 'href') {
                    button.setAttribute(attr.name, attr.value);
                }
            }

            menuItem.replaceChild(button, link);
            return button;
        }

        setUpAria(submenu, button, index) {
            const submenuId = submenu.getAttribute('id');
            let id;

            if (!submenuId) {
                id = `submenu-${this.menuIndex}-${index}`;
                submenu.setAttribute('id', id);
            } else {
                id = submenuId;
            }

            button.setAttribute('aria-controls', id);
            button.setAttribute('aria-expanded', false);
            submenu.setAttribute('aria-hidden', true);
        }
    }

    // Function to initialize the menu
    function initNavigationMenu() {
        // Add styles to head
        document.head.insertAdjacentHTML('beforeend', menuStyles);

        // Add navigation to body (at the beginning)
        document.body.insertAdjacentHTML('afterbegin', navigationHTML);

        // Initialize clicky menus
        const menus = document.querySelectorAll('.clicky-menu');
        let i = 1;
        menus.forEach((menu) => {
            const clickyMenu = new ClickyMenus(menu, i);
            clickyMenu.init();
            i++;
        });

        // Add event listener for close buttons
        const menuClosers = document.querySelectorAll('[data-clicky-menus-close]');
        menuClosers.forEach((menuCloser) => {
            menuCloser.addEventListener('click', (e) => {
                const menuId = e.currentTarget.getAttribute('data-clicky-menus-close');
                const menu = document.getElementById(menuId);
                if (menu) {
                    menu.dispatchEvent(new Event('clickyMenusClose'));
                }
            });
        });

        // Highlight current page in menu
        highlightCurrentPage();
    }

    // Function to highlight current page in menu
    function highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'csvmatcher.html';
        const menuLinks = document.querySelectorAll('.dimtools-navigation .main-menu > li > a');
        
        // Remove current class from all
        document.querySelectorAll('.dimtools-navigation .main-menu > li.current').forEach(li => {
            li.classList.remove('current');
        });

        // Add current class to matching link
        menuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'csvmatcher.html')) {
                link.parentElement.classList.add('current');
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