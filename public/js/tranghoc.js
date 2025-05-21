document.addEventListener("DOMContentLoaded", function () {
  const quizForm = document.querySelector("#quizPopup form");
  const quizScore = document.getElementById("quizScore");

  const quizResult = document.getElementById("quizResult");
  const finishQuizBtn = document.getElementById("finishQuizBtn");
  const submitBtn = quizForm.querySelector(".btn-submit");
  const btn = document.getElementById('completeBtn');
  const quizzPopup = document.getElementById('quizPopup');
  const allLabels = quizForm.querySelectorAll('label');
  let lastQuizzData = null; // Lưu dữ liệu quizz mới nhất
  // === Nút mở popup quizz ===
  if (btn && quizzPopup) {
    btn.addEventListener('click', async () => {
      // Lấy thông tin bài học đang active
      const activeItem = document.querySelector('.item.active');
      const params = new URLSearchParams(window.location.search);
      if (activeItem) {
        const id_course = params.get('id_course');
        const id_chapter = activeItem.getAttribute('data-id_chapter');
        const id_lesson = activeItem.getAttribute('data-id_lesson');
        const stt = activeItem.getAttribute('data-stt');
        // Gọi API lấy quizz
        try {
          const res = await fetch(`/lesson-quizz?id_course=${id_course}&id_chapter=${id_chapter}&id_lesson=${id_lesson}`);
          const data = await res.json();
          console.log(`/lesson-quizz?id_course=${id_course}&id_chapter=${id_chapter}&id_lesson=${id_lesson}`);
          console.log('Dữ liệu quizz:', data);
          // Tạo động các câu hỏi trong form
          if (data.success && Array.isArray(data.data)) {
            lastQuizzData = data.data; // Lưu lại để dùng khi chấm điểm
            // Xoá các câu hỏi cũ
            const form = document.querySelector('#quizPopup form');
            // Xoá tất cả .question-box cũ
            form.querySelectorAll('.question-box').forEach(qb => qb.remove());
            // Thêm mới các câu hỏi
            data.data.forEach((quizz, idx) => {
              const box = document.createElement('div');
              box.className = 'question-box';
              // Câu hỏi
              const p = document.createElement('p');
              p.textContent = `${idx + 1}. ${quizz.question}`;
              box.appendChild(p);
              if (quizz.type === 'radio' || quizz.type === 'checkbox') {
                const ul = document.createElement('ul');
                ul.className = 'answer-list';
                quizz.answers.forEach(ans => {
                  const li = document.createElement('li');
                  const label = document.createElement('label');
                  const input = document.createElement('input');
                  input.type = quizz.type;
                  input.name = `q${idx + 1}`;
                  input.value = ans.id_answer;
                  label.appendChild(input);
                  label.appendChild(document.createTextNode(' ' + ans.content));
                  li.appendChild(label);
                  ul.appendChild(li);
                });
                box.appendChild(ul);
              } else if (quizz.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `q${idx + 1}`;
                input.placeholder = '...';
                input.style.width = '100%';
                input.style.padding = '10px';
                input.style.borderRadius = '10px';
                input.style.border = '1px solid #ccc';
                box.appendChild(input);
              }
              // Thêm vào form, trước nút submit
              const submitBtn = form.querySelector('.btn-submit');
              form.insertBefore(box, submitBtn);
            });
          }
        } catch (err) {
          console.error('Lỗi lấy quizz:', err);
        }
      }

      quizResult.style.display = "none";
      quizzPopup.style.display = 'flex';
      submitBtn.style.display = "block";
      allLabels.forEach(label => {
        label.classList.remove('correct-answer', 'incorrect-user-answer');
      });
    });
  }

  // Bình luận
  // === Gửi bình luận ===
  const sendBtn = document.getElementById("sendComment");
  const commentInput = document.getElementById("commentInput");
  const commentList = document.getElementById("commentList");
  const commentCountEl = document.querySelector(".comment-section h4 span");

  // Hàm cập nhật số lượng bình luận
  function updateCommentCount() {
    const commentCount = commentList.querySelectorAll("p").length;
    if (commentCountEl) {
      commentCountEl.textContent = `${commentCount} bình luận`;
    }
  }

  // Gọi 1 lần khi trang vừa load
  updateCommentCount();

  if (sendBtn && commentInput && commentList) {
    sendBtn.addEventListener("click", () => {
      const content = commentInput.value.trim();
      if (content !== "") {
        const p = document.createElement("p");
        p.innerHTML = `<strong>Bạn</strong><br>${content}`;
        commentList.appendChild(p);
        commentInput.value = "";

        // Cập nhật số bình luận sau khi thêm
        updateCommentCount();
      }
    });
  }



  // === Xử lý quizz ===
  /**
      * Object lưu trữ đáp án đúng của tất cả câu hỏi*/
  const correctAnswers = {
    0: 'OpenAI',
    1: ['1', '3'],
    2: 'Generative Pre-trained Transformer'

  };

  /**
   * Hàm dành cho dạng câu nhiều đáp án
   * @param {string} arr1  đáp án người dùng 
   * @param {string} arr2  đáp án đúng 
   */
  function multiplechoice(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    // Sắp xếp để so sánh không phụ thuộc thứ tự
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) return false;
    }
    return true;
  }
  /**
  * Xử lý khi nhấn nút submit
  */
  if (quizForm) {
    quizForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let score = 0;
      const questionBoxes = quizForm.querySelectorAll('.question-box');
      const totalQuestions = questionBoxes.length;


      allLabels.forEach(label => {
        label.classList.remove('correct-answer', 'incorrect-user-answer');
      });
      submitBtn.style.display = "none";

      console.log(questionBoxes);
      // Sử dụng lastQuizzData để chấm điểm
      if (!lastQuizzData) {
        alert('Không có dữ liệu quizz!');
        return;
      }
      questionBoxes.forEach((box, index) => {
        const quizz = lastQuizzData[index];
        if (!quizz) return;
        const type = quizz.type;
        let isCorrect = false;
        if (type === 'radio') {
          // Đáp án đúng
          const correctAns = quizz.answers.find(a => a.istrue == 1);
          const selected = box.querySelector('input[type="radio"]:checked');
          const allInput = box.querySelectorAll('input[type="radio"]');
          allInput.forEach(input => {
            const label = input.closest('label');
            if (selected && input === selected && input.value == correctAns.id_answer) {
              isCorrect = true;
              label.classList.add('correct-answer');
            } else if (selected && input === selected) {
              label.classList.add('incorrect-user-answer');
            }
          });
        } else if (type === 'checkbox') {
          // Tập hợp đáp án đúng
          const correctAns = quizz.answers.filter(a => a.istrue == 1).map(a => a.id_answer.toString());
          const selected = Array.from(box.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
          const allInput = box.querySelectorAll('input[type="checkbox"]');
          // So sánh hai mảng (không phân biệt thứ tự)
          const arraysEqual = (a, b) => a.length === b.length && a.sort().every((v, i) => v === b.sort()[i]);
          if (arraysEqual(selected, correctAns)) {
            isCorrect = true;
          }
          allInput.forEach(input => {
            const label = input.closest('label');
            if (correctAns.includes(input.value) && input.checked) {
              label.classList.add('correct-answer');
            } else if (input.checked) {
              label.classList.add('incorrect-user-answer');
            }
          });
          if (!isCorrect) {
            const p = document.createElement('p');
            p.classList = "alarm-quizz";
            p.textContent = 'Thừa hoặc thiếu đáp án đúng';
            p.style.color = 'red';
            box.appendChild(p);
          }
        } else if (type === 'text') {
          // Có thể có nhiều đáp án đúng
          const correctAns = quizz.answers.filter(a => a.istrue == 1).map(a => a.content.trim().toLowerCase());
          const input = box.querySelector('input[type="text"]');
          if (input && correctAns.some(ans => input.value.trim().toLowerCase() === ans)) {
            isCorrect = true;
            input.style.backgroundColor = "#d1fae5";
          } else {
            input.style.backgroundColor = "#fee2e2";
          }
        }
        if (isCorrect) score++;
      });
      if (quizScore && quizResult) {
        if (score >= Math.ceil((2 * totalQuestions) / 3)) {
          quizScore.textContent = `Kết quả: ${score} / ${totalQuestions} câu đúng. Đạt!`;
          finishQuizBtn.textContent = 'Hoàn thành bài học';
          finishQuizBtn.style.backgroundColor = '#22c55e'; // xanh lá
          finishQuizBtn.style.color = '#fff';
          finishQuizBtn.onclick = async function () {
            // Lấy thông tin bài học hiện tại
            const activeItem = document.querySelector('.item.active');
            const params = new URLSearchParams(window.location.search);
            if (activeItem) {
              const id_course = params.get('id_course');
              const id_chapter = activeItem.getAttribute('data-id_chapter');
              const id_lesson = activeItem.getAttribute('data-id_lesson');
              const stt = parseInt(activeItem.getAttribute('data-stt'));
              // Gọi API cập nhật roadmap (giả sử đã có API /update-roadmap)
              try {
                const res = await fetch('/update-roadmap', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id_course, stt: stt + 1 })
                });
                const data = await res.json();
                if (data.success) {
                  if (data.updated) {
                    // Đã cập nhật, chuyển sang bài tiếp theo như cũ
                    const nextItem = document.querySelector(`.item[data-stt='${stt + 1}']`);
                    if (nextItem) {
                      location.reload();
                      quizzPopup.style.display = 'none';
                    } else {
                      alert('Đã hoàn thành khoá học');
                      quizzPopup.style.display = 'none';
                    }
                  } else {
                    // Không cập nhật (học lại bài cũ), chỉ đóng popup và có thể báo cho user
                    alert('Bạn đã hoàn thành bài học này trước đó!');
                    quizzPopup.style.display = 'none';
                  }
                } else {
                  alert(data.message || 'Lỗi cập nhật tiến trình!');
                }
              } catch (err) {
                alert('Lỗi cập nhật tiến trình!');
              }
            }
          };
        } else {
          quizScore.textContent = `Kết quả: ${score} / ${totalQuestions} câu đúng. Không đạt!`;
          finishQuizBtn.textContent = 'Học lại';
          finishQuizBtn.style.backgroundColor = '#ef4444'; // đỏ
          finishQuizBtn.style.color = '#fff';
          finishQuizBtn.onclick = function () {
            // Reload lại bài học hiện tại
            quizzPopup.style.display = 'none';
          };
        }
        quizResult.style.display = "block";
      }
    });
  }

  // Nút hoàn thành để ẩn popup
  if (finishQuizBtn) {
    finishQuizBtn.addEventListener("click", () => {
      quizzPopup.style.display = "none";
    });
  }

  document.querySelectorAll('.item.locked').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Bạn phải hoàn thành bài học trước');
    });
  });

  // Hàm cập nhật nội dung bài học vào section .content
  function updateLessonContent(lessonData, item) {
    const contentSection = document.querySelector('.content');
    if (!contentSection) return;
    // 1. Video/Image
    const videoWrapper = contentSection.querySelector('.video-wrapper');
    if (videoWrapper) {
      if (lessonData.url) {
        if (lessonData.url.startsWith('/')) {
          videoWrapper.innerHTML = `<img src="${lessonData.url}" alt="Đang tải" style="max-width:100%;height:auto;">`;
        } else if (lessonData.url.startsWith('<')) {
          videoWrapper.innerHTML = lessonData.url;
        } else {
          videoWrapper.innerHTML = '';
        }
      } else {
        videoWrapper.innerHTML = '';
      }
    }
    // 2. Tiêu đề bài học (h2 đầu tiên)
    const h2 = contentSection.querySelector('h2');
    if (item) {
      lessonName = item.textContent;
    }
    if (h2 && lessonName) {
      h2.textContent = lessonName;
    }
    // 3. Review (HTML) vào div .lesson-review
    let reviewDiv = contentSection.querySelector('.lesson-review');
    if (!reviewDiv) {
      // Nếu chưa có thì tạo mới và chèn vào sau .highlight-box
      const highlightBox = contentSection.querySelector('.highlight-box');
      reviewDiv = document.createElement('div');
      reviewDiv.className = 'lesson-review';
      if (highlightBox && highlightBox.parentNode) {
        highlightBox.parentNode.insertBefore(reviewDiv, highlightBox.nextSibling);
      } else {
        contentSection.appendChild(reviewDiv);
      }
    }
    if (lessonData.review) {
      reviewDiv.innerHTML = lessonData.review;
    } else {
      reviewDiv.innerHTML = '';
    }
    // 4. Content (HTML) vào dưới thẻ h4 trong .highlight-box
    const highlightBox = contentSection.querySelector('.highlight-box');
    if (highlightBox) {
      const h4 = highlightBox.querySelector('h4');
      if (h4) {
        // Xoá các node sau h4 (nội dung cũ)
        let next = h4.nextSibling;
        while (next) {
          const toRemove = next;
          next = next.nextSibling;
          highlightBox.removeChild(toRemove);
        }
        // Thêm nội dung mới
        if (lessonData.content) {
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = lessonData.content;
          highlightBox.appendChild(contentDiv);
        }
      }
    }
  }

  // Khi trang load, tự động lấy nội dung bài học đang học và in ra console
  const activeItem = document.querySelector('.item.active');
  const params = new URLSearchParams(window.location.search)
  if (activeItem) {
    const id_course = params.get("id_course");
    const id_chapter = activeItem.getAttribute('data-id_chapter');
    const id_lesson = activeItem.getAttribute('data-id_lesson');
    const stt = activeItem.getAttribute('data-stt');
    fetch(`/lesson-content?id_course=${id_course}&id_chapter=${id_chapter}&id_lesson=${id_lesson}&stt=${stt}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Nội dung bài học đang học:', data.data);
          updateLessonContent(data.data, activeItem);
        } else {
          console.warn('Không lấy được nội dung bài học:', data.message, id_course, id_chapter, id_lesson, stt);
        }
      });
  }

  // Xử lý click chọn bài học đã unlock (không có class locked)
  document.querySelectorAll('.item:not(.locked)').forEach(function (item) {
    item.addEventListener('click', function (e) {
      // Xoá class active ở tất cả item
      document.querySelectorAll('.item.active').forEach(function (i) {
        i.classList.remove('active');
      });
      // Thêm class active cho item vừa click
      item.classList.add('active');
      // Lấy thông tin bài học
      const params = new URLSearchParams(window.location.search);
      const id_course = params.get('id_course');
      const id_chapter = item.getAttribute('data-id_chapter');
      const id_lesson = item.getAttribute('data-id_lesson');
      const stt = item.getAttribute('data-stt');
      fetch(`/lesson-content?id_course=${id_course}&id_chapter=${id_chapter}&id_lesson=${id_lesson}&stt=${stt}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Nội dung bài học:', data.data);
            updateLessonContent(data.data, item);
          } else {
            console.warn('Không lấy được nội dung bài học:', data.message, id_course, id_chapter, id_lesson, stt);
          }
        });
    });
  });

  const registerBtn = document.getElementById('registerCourseBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', async function () {
      const urlParams = new URLSearchParams(window.location.search);
      const id_course = urlParams.get('id_course');
      if (!id_course) return alert('Thiếu thông tin khoá học!');
      try {
        const res = await fetch('/register-course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_course })
        });
        const data = await res.json();
        if (data.success) {
          // Lấy luôn nội dung bài học 1 sau khi đăng ký thành công
          fetch(`/lesson-content?id_course=${id_course}&stt=1`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log('Nội dung bài học 1 sau khi đăng ký:', data.data);
              } else {
                console.warn('Không lấy được nội dung bài học 1:', data.message, id_course);
              }
            });
          // Reload hoặc chuyển hướng nếu muốn
          // location.reload();
        } else {
          alert(data.message || 'Đăng ký thất bại!');
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi đăng ký!');
      }
    });
  }

  // Hàm cập nhật progress bar
  function updateProgressBar() {
    const activeItem = document.querySelector('.item.active');
    const allItems = document.querySelectorAll('.item');
    const progressBar = document.querySelector('.progress-bar');
    const progress = progressBar ? progressBar.querySelector('.progress') : null;
    if (activeItem && allItems.length && progressBar && progress) {
      const stt = parseInt(activeItem.getAttribute('data-stt'));
      const total = allItems.length;
      const percent = Math.round((stt / total) * 100);
      progress.style.width = percent + '%';
      // Hiển thị tỉ lệ trong progress-bar
      let ratioSpan = document.querySelector('.progress-ratio');
      ratioSpan.textContent = `${stt}/${total}`;
    }
  }

  // Gọi khi trang load
  updateProgressBar();


});
