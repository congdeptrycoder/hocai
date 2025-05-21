document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-box input');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    document.querySelector('.search-box').appendChild(searchResults);

    // Lấy tất cả các liên kết từ sidebar và footer
    const sidebarLinks = Array.from(document.querySelectorAll('.side-bar-menu a'));
    const footerLinks = Array.from(document.querySelectorAll('.footer-box h3 a'));

    // Hàm chuyển đổi chữ có dấu sang không dấu
    function removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    // Hàm tìm kiếm từ khóa trong text
    function findMatches(wordToMatch, links) {
        const searchTerm = removeAccents(wordToMatch);
        return links.filter(link => {
            const text = removeAccents(link.textContent);
            const href = link.getAttribute('href');
            return text.includes(searchTerm) && href;
        });
    }

    // Hàm hiển thị kết quả tìm kiếm
    function displayMatches() {
        const searchTerm = this.value;
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const sidebarMatches = findMatches(searchTerm, sidebarLinks);
        const footerMatches = findMatches(searchTerm, footerLinks);
        
        // Kết hợp và giới hạn kết quả
        const allMatches = [...sidebarMatches, ...footerMatches].slice(0, 5);

        if (allMatches.length > 0) {
            const html = allMatches.map(match => {
                return `
                    <div class="search-result-item">
                        <a href="${match.getAttribute('href')}">${match.textContent}</a>
                    </div>
                `;
            }).join('');
            searchResults.innerHTML = html;
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <i>Không có kết quả</i>
                </div>
            `;
        }
        searchResults.style.display = 'block';
    }

    // Thêm sự kiện input cho ô tìm kiếm
    searchInput.addEventListener('input', displayMatches);

    // Ẩn kết quả khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-box')) {
            searchResults.style.display = 'none';
        }
    });
}); 