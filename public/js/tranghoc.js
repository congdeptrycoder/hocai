document.addEventListener("DOMContentLoaded", () => {
    // Nút hoàn thành bài học
    const completeBtn = document.getElementById("completeBtn");
    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        completeBtn.textContent = "✔ Đã hoàn thành!";
        completeBtn.style.backgroundColor = "#16a34a";
      });
    }
  
    // Gửi bình luận
    const sendBtn = document.getElementById("sendComment");
    const commentInput = document.getElementById("commentInput");
    const commentList = document.getElementById("commentList");
  
    if (sendBtn && commentInput && commentList) {
      sendBtn.addEventListener("click", () => {
        const content = commentInput.value.trim();
        if (content !== "") {
          const p = document.createElement("p");
          p.innerHTML = `<strong>Bạn</strong><br>${content}`;
          commentList.appendChild(p);
          commentInput.value = "";
        }
      });
    }
  
  });
  