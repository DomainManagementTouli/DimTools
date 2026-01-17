// Minimal navigation - single Home link only
document.addEventListener('DOMContentLoaded', function() {
    // Only add navigation if we're NOT on index.html
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html') {
        return; // Don't add navigation to home page
    }

    const navHTML = `
    <a href="index.html" style="position: fixed; top: 15px; left: 15px; z-index: 9999; text-decoration: none;">
        <div style="
            width: 44px;
            height: 44px;
            background: white;
            border: 2px solid #8b4513;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 20px;
            cursor: pointer;
            transition: transform 0.2s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            🏠
        </div>
    </a>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
});
