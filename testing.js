// ========== PAGE NAVIGATION ==========



function showPage(pageId) {
    // Hide all page sections
    const allPages = document.querySelectorAll('section.page-section');
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default active page
    const defaultPage = 'beranda';
    showPage(defaultPage);
    
    // Set up nav link click handlers
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });

    // Set up form login handler
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            loginUser();
        });
    }

    // Set up form daftar handler
    const formDaftar = document.getElementById('formDaftar');
    if (formDaftar) {
        formDaftar.addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });
    }
});

function openModal(id) {
    console.log('Opening modal:', id);
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "block";
        console.log('Modal opened successfully');
    } else {
        console.error('Modal not found:', id);
    }
}

function closeModal(id) {
    console.log('Closing modal:', id);
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
        console.log('Modal closed successfully');
    } else {
        console.error('Modal not found:', id);
    }
}

// Menutup modal jika user klik di luar area form
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

function loginUser() {
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!identifier || !password) {
        alert('Silakan isi NPM/Email dan kata sandi!');
        return;
    }

    // Coba login ke server, tapi jika gagal, simulasi login untuk demo
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            npm: identifier // Menggunakan NPM untuk login sederhana
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Pengguna tidak ditemukan');
            return; // Stop di sini, tidak lanjut simulasi
        }

        // Simpan data user yang login
        window.currentUserId = data.user.id;
        window.currentUser = data.user;

        alert('Login berhasil! Selamat datang, ' + (window.currentUser.nama || 'User'));
        closeModal('modalLogin');

        // Redirect ke halaman pembayaran atau dashboard
        showPage('pembayaran');
    })
    .catch(error => {
        console.error('Error:', error);
        // Server tidak tersedia, langsung simulasi login
        window.currentUserId = 1;
        window.currentUser = {
            id: 1,
            nama: 'User Demo',
            npm: identifier,
            email: 'demo@email.com'
        };

        alert('Login berhasil! Selamat datang, ' + window.currentUser.nama);
        closeModal('modalLogin');
        showPage('pembayaran');
    });
}

// ========== FUNGSI PEMBAYARAN SECTION ==========

let selectedMaterial = null;
let selectedMaterialName = null;
let selectedPaymentPackage = null;
let selectedPaymentPrice = 0;
let selectedPaymentMethod = null;

// Data pembayaran user
let paymentUserNama = null;
let paymentUserNpm = null;
let paymentUserEmail = null;
let paymentUserTelepon = null;
let paymentTransactionId = null;

function selectMaterialForPayment(materialName, materialCode) {
    selectedMaterial = materialCode;
    selectedMaterialName = materialName;
    
    // Update summary
    document.getElementById('materiPilihan').innerHTML = `<strong style="color: #27ae60;">✓ Anda memilih: ${materialName}</strong>`;
    document.getElementById('summaryMaterial').textContent = materialName;
    
    // Update materi selection card
    const materiCards = document.querySelectorAll('.materi-selection-card');
    materiCards.forEach(card => {
        const radio = card.querySelector('.materi-selection-radio');
        if (radio.value === materialCode) {
            card.classList.add('active');
            radio.checked = true;
        } else {
            card.classList.remove('active');
        }
    });
    
    // Navigate to payment page
    showPage('pembayaran');
}

function selectMaterialFromPayment(element, materialName, materialCode) {
    // Remove active class from all materi selection cards
    document.querySelectorAll('.materi-selection-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected card
    element.classList.add('active');
    element.querySelector('.materi-selection-radio').checked = true;
    
    selectedMaterial = materialCode;
    selectedMaterialName = materialName;
    
    // Update summary
    document.getElementById('materiPilihan').innerHTML = `<strong style="color: #27ae60;">✓ Anda memilih: ${materialName}</strong>`;
    document.getElementById('summaryMaterial').textContent = materialName;
}

function selectPaymentPackage(element, packageName, price) {
    // Remove active class from all packages
    document.querySelectorAll('.package-item').forEach(pkg => {
        pkg.classList.remove('active');
    });
    
    // Add active class to selected package
    element.classList.add('active');
    element.querySelector('.package-item-radio').checked = true;
    
    selectedPaymentPackage = packageName;
    selectedPaymentPrice = price;
    
    // Update summary
    const packageLabel = packageName.charAt(0).toUpperCase() + packageName.slice(1);
    document.getElementById('summaryPackage').textContent = packageLabel;
    updatePaymentTotal();
}

function selectPaymentMethod(element, methodCode) {
    // Remove active class from all methods
    document.querySelectorAll('.method-option').forEach(method => {
        method.classList.remove('active');
    });
    
    // Add active class to selected method
    element.classList.add('active');
    selectedPaymentMethod = methodCode;
    
    // Update summary
    const methodLabel = element.querySelector('h4').textContent;
    document.getElementById('summaryMethod').textContent = methodLabel;
}

function updatePaymentTotal() {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    document.getElementById('summaryTotal').textContent = formatter.format(selectedPaymentPrice);
}

function proceedPayment() {
    if (!selectedMaterial) {
        alert('⚠️ Silakan pilih materi pelatihan terlebih dahulu!');
        return;
    }
    
    if (!selectedPaymentPackage) {
        alert('⚠️ Silakan pilih paket pembayaran!');
        return;
    }
    
    if (!selectedPaymentMethod) {
        alert('⚠️ Silakan pilih metode pembayaran!');
        return;
    }
    
    // Bersihkan form sebelumnya
    document.getElementById('paymentNama').value = '';
    document.getElementById('paymentNpm').value = '';
    document.getElementById('paymentEmail').value = '';
    document.getElementById('paymentTelepon').value = '';
    
    // Buka form modal untuk input data
    openModal('modalDataPembayaran');
}

function submitDataPembayaran() {
    // Ambil nilai dari form
    const nama = document.getElementById('paymentNama').value.trim();
    const npm = document.getElementById('paymentNpm').value.trim();
    const email = document.getElementById('paymentEmail').value.trim();
    const telepon = document.getElementById('paymentTelepon').value.trim();
    
    // Validasi
    if (!nama) {
        alert('⚠️ Nama lengkap harus diisi!');
        return;
    }
    
    if (!npm) {
        alert('⚠️ NPM harus diisi!');
        return;
    }
    
    if (!email) {
        alert('⚠️ Email harus diisi!');
        return;
    }
    
    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('⚠️ Format email tidak valid!');
        return;
    }
    
    if (!telepon) {
        alert('⚠️ Nomor telepon harus diisi!');
        return;
    }
    
    // Coba kirim data pembayaran ke server
    fetch('http://localhost:3000/api/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: window.currentUserId || 1, // Default userId jika tidak ada
            materialName: selectedMaterialName,
            materialCode: selectedMaterial,
            packageName: selectedPaymentPackage,
            price: selectedPaymentPrice,
            paymentMethod: selectedPaymentMethod
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Peringatan: ' + data.error + '\n\nMelanjutkan tanpa menyimpan ke database...');
            paymentTransactionId = 'DEMO-' + Date.now();
        } else {
            paymentTransactionId = data.transactionId;
            alert('Pembayaran berhasil disimpan ke database!');
        }
        
        // Lanjutkan dengan proses normal...
        paymentUserNama = nama;
        paymentUserNpm = npm;
        paymentUserEmail = email;
        paymentUserTelepon = telepon;
        paymentTransactionId = data.transactionId;
        
        // Update confirmation modal content
        document.getElementById('confirmTransactionId').textContent = paymentTransactionId;
        document.getElementById('confirmMaterial').textContent = selectedMaterialName;
        
        const packageLabel = selectedPaymentPackage.charAt(0).toUpperCase() + selectedPaymentPackage.slice(1);
        document.getElementById('confirmPackage').textContent = packageLabel;
        
        const methodLabel = document.querySelector('.method-option.active h4').textContent;
        document.getElementById('confirmPaymentMethod').textContent = methodLabel;
        
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        document.getElementById('confirmTotal').textContent = formatter.format(selectedPaymentPrice);
        
        // Format waktu
        const timestamp = new Date();
        const timeString = timestamp.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('confirmTime').textContent = timeString;
        
        // Tambahkan data user ke confirmation modal
        const detailBox = document.querySelector('.confirmation-detail-box');
        
        // Cek dan hapus data user sebelumnya jika ada
        const existingUserData = document.querySelectorAll('[data-detail="user"]');
        existingUserData.forEach(el => el.remove());
        
        // Tambahkan data user
        const userDataHTML = `
            <div class="detail-row" data-detail="user">
                <span>Nama Lengkap:</span>
                <span>${nama}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>NPM:</span>
                <span>${npm}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>Email:</span>
                <span>${email}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>Nomor Telepon:</span>
                <span>${telepon}</span>
            </div>
        `;
        
        // Cari row terakhir sebelum payment instruction dan insert di situ
        const lastDetailRow = detailBox.querySelector('.detail-row:last-child');
        if (lastDetailRow) {
            lastDetailRow.insertAdjacentHTML('afterend', userDataHTML);
        } else {
            detailBox.insertAdjacentHTML('beforeend', userDataHTML);
        }
        
        // Generate payment instructions
        generatePaymentInstructions(selectedPaymentMethod, selectedPaymentPrice);
        
        // Tutup form modal
        closeModal('modalDataPembayaran');
        
        // Buka confirmation modal
        openModal('modalKonfirmasiPembayaran');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Server tidak tersedia. Melanjutkan dalam mode demo...\n\nData pembayaran tidak akan tersimpan.');
        
        // Simulasi pembayaran untuk demo
        paymentTransactionId = 'DEMO-' + Date.now();
        
        // Lanjutkan dengan proses normal untuk demo
        // Simpan data
        paymentUserNama = nama;
        paymentUserNpm = npm;
        paymentUserEmail = email;
        paymentUserTelepon = telepon;
        
        // Update confirmation modal content
        document.getElementById('confirmTransactionId').textContent = paymentTransactionId;
        document.getElementById('confirmMaterial').textContent = selectedMaterialName;
        
        const packageLabel = selectedPaymentPackage.charAt(0).toUpperCase() + selectedPaymentPackage.slice(1);
        document.getElementById('confirmPackage').textContent = packageLabel;
        
        const methodLabel = document.querySelector('.method-option.active h4').textContent;
        document.getElementById('confirmPaymentMethod').textContent = methodLabel;
        
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        document.getElementById('confirmTotal').textContent = formatter.format(selectedPaymentPrice);
        
        // Format waktu
        const timestamp = new Date();
        const timeString = timestamp.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('confirmTime').textContent = timeString;
        
        // Tambahkan data user ke confirmation modal
        const detailBox = document.querySelector('.confirmation-detail-box');
        
        // Cek dan hapus data user sebelumnya jika ada
        const existingUserData = document.querySelectorAll('[data-detail="user"]');
        existingUserData.forEach(el => el.remove());
        
        // Tambahkan data user
        const userDataHTML = `
            <div class="detail-row" data-detail="user">
                <span>Nama Lengkap:</span>
                <span>${nama}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>NPM:</span>
                <span>${npm}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>Email:</span>
                <span>${email}</span>
            </div>
            <div class="detail-row" data-detail="user">
                <span>Nomor Telepon:</span>
                <span>${telepon}</span>
            </div>
        `;
        
        // Cari row terakhir sebelum payment instruction dan insert di situ
        const lastDetailRow = detailBox.querySelector('.detail-row:last-child');
        if (lastDetailRow) {
            lastDetailRow.insertAdjacentHTML('afterend', userDataHTML);
        } else {
            detailBox.insertAdjacentHTML('beforeend', userDataHTML);
        }
        
        // Generate payment instructions
        generatePaymentInstructions(selectedPaymentMethod, selectedPaymentPrice);
        
        // Tutup form modal
        closeModal('modalDataPembayaran');
        
        // Buka confirmation modal
        openModal('modalKonfirmasiPembayaran');
    });
}

function generatePaymentInstructions(method, price) {
    let instructionHTML = '';
    
    switch(method) {
        case 'transfer':
            instructionHTML = `
                <p><strong>Bank:</strong> BCA</p>
                <p><strong>Nomor Rekening:</strong> 123-456-7890</p>
                <p><strong>Atas Nama:</strong> UNISKA Lab Komputer</p>
                <p><strong>Jumlah Pembayaran:</strong> Rp ${price.toLocaleString('id-ID')}</p>
                <p style="color: #d97706; margin-top: 15px;"><strong>⚠️ Catatan:</strong> Cantumkan NPM dan nama Anda sebagai bukti transfer di deskripsi</p>
            `;
            break;
        case 'card':
            instructionHTML = `
                <p><strong>Jenis Kartu:</strong> Visa, Mastercard, atau Kartu Debit</p>
                <p><strong>Jumlah Pembayaran:</strong> Rp ${price.toLocaleString('id-ID')}</p>
                <p><strong>Proses:</strong> Sistem akan mengarahkan Anda ke payment gateway yang aman</p>
                <p style="color: #d97706; margin-top: 15px;"><strong>⚠️ Catatan:</strong> Pastikan kartu Anda aktif dan memiliki saldo cukup</p>
            `;
            break;
        case 'ewallet':
            instructionHTML = `
                <p><strong>Metode E-Wallet:</strong> GCash, Dana, atau OVO</p>
                <p><strong>Jumlah Pembayaran:</strong> Rp ${price.toLocaleString('id-ID')}</p>
                <p><strong>Nomor Tujuan:</strong> +62 812-3456-7890 (atau sesuai informasi dari admin)</p>
                <p style="color: #d97706; margin-top: 15px;"><strong>⚠️ Catatan:</strong> Kirim bukti pembayaran ke WhatsApp atau email kami setelah transfer</p>
            `;
            break;
        case 'cash':
            instructionHTML = `
                <p><strong>Lokasi Pembayaran:</strong> Lab Komputer UNISKA, Gedung D Lantai 2</p>
                <p><strong>Jumlah Pembayaran:</strong> Rp ${price.toLocaleString('id-ID')}</p>
                <p><strong>Jam Operasional:</strong> Senin - Jumat, 08:00 - 16:00 WIB</p>
                <p><strong>Penanggung Jawab:</strong> Admin Lab Komputer UNISKA</p>
                <p style="color: #d97706; margin-top: 15px;"><strong>⚠️ Catatan:</strong> Tunjukkan halaman ini atau ID Transaksi saat melakukan pembayaran</p>
            `;
            break;
    }
    
    document.getElementById('paymentInstructionContent').innerHTML = instructionHTML;
}

function backToHome() {
    // Reset form
    selectedMaterial = null;
    selectedMaterialName = null;
    selectedPaymentPackage = null;
    selectedPaymentPrice = 0;
    selectedPaymentMethod = null;
    
    // Reset user data
    paymentUserNama = null;
    paymentUserNpm = null;
    paymentUserEmail = null;
    paymentUserTelepon = null;
    paymentTransactionId = null;
    
    // Reset UI
    document.querySelectorAll('.materi-selection-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.package-item').forEach(pkg => pkg.classList.remove('active'));
    document.querySelectorAll('.method-option').forEach(method => method.classList.remove('active'));
    
    // Reset summaries
    document.getElementById('materiPilihan').textContent = 'Pilih materi Anda terlebih dahulu';
    document.getElementById('summaryMaterial').textContent = '-';
    document.getElementById('summaryPackage').textContent = '-';
    document.getElementById('summaryMethod').textContent = '-';
    document.getElementById('summaryTotal').textContent = 'Rp 0';
    
    // Close modal
    closeModal('modalKonfirmasiPembayaran');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== FUNGSI PEMBAYARAN MODAL (LEGACY) ==========

let selectedPackage = null;
let selectedPrice = 0;

function registerUser() {
    // Validasi form registrasi
    const nama = document.getElementById('namaInput').value.trim();
    const npm = document.getElementById('npmInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const program = document.getElementById('programInput').value;

    if (!nama || !npm || !email || !program) {
        alert('Silakan lengkapi semua data registrasi terlebih dahulu!');
        return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Format email tidak valid!');
        return;
    }

    // Kirim data ke server
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nama: nama,
            npm: npm,
            email: email,
            telepon: program // Menggunakan program sebagai telepon untuk sementara
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Pendaftaran berhasil! Silakan akses halaman Pembayaran untuk melanjutkan proses pembayaran.');
            // Tutup modal daftar
            closeModal('modalDaftar');
            // Reset form
            document.getElementById('formDaftar').reset();
            // Kembali ke halaman beranda atau tetap di halaman saat ini
            // Tidak redirect otomatis ke halaman pembayaran
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    });
}

function selectPackage(element, packageType, price) {
    // Hapus class active dari semua package card
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('active');
    });

    // Tambah class active ke package yang dipilih
    element.classList.add('active');

    // Update radio button
    document.querySelector(`input[value="${packageType}"]`).checked = true;

    // Simpan package yang dipilih
    selectedPackage = packageType;
    selectedPrice = price;

    // Update total price
    updateTotalPrice(price);
}

function updateTotalPrice(price) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    document.getElementById('totalPrice').textContent = formatter.format(price);
}

function processPayment() {
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!selectedPackage) {
        alert('Silakan pilih paket pembayaran terlebih dahulu!');
        return;
    }

    if (!paymentMethod) {
        alert('Silakan pilih metode pembayaran!');
        return;
    }

    // Data pembayaran
    const paymentData = {
        nama: document.getElementById('summaryNama').textContent,
        npm: document.getElementById('summaryNpm').textContent,
        program: document.getElementById('summaryProgram').textContent,
        package: selectedPackage,
        price: selectedPrice,
        method: paymentMethod,
        timestamp: new Date().toLocaleString('id-ID')
    };

    // Tampilkan detail pembayaran berdasarkan metode
    displayPaymentDetails(paymentData);
}

function displayPaymentDetails(paymentData) {
    let accountInfo = '';

    switch(paymentData.method) {
        case 'transfer':
            accountInfo = `
                <div class="payment-instruction">
                    <h4>Instruksi Transfer Bank</h4>
                    <p><strong>Bank:</strong> BCA</p>
                    <p><strong>Nomor Rekening:</strong> 123-456-7890</p>
                    <p><strong>Atas Nama:</strong> UNISKA Lab Komputer</p>
                    <p><strong>Jumlah:</strong> Rp ${paymentData.price.toLocaleString('id-ID')}</p>
                    <p style="color: #e74c3c; margin-top: 10px;"><strong>* Cantumkan NPM (${paymentData.npm}) sebagai bukti transfer</strong></p>
                </div>
            `;
            break;
        case 'ewallet':
            accountInfo = `
                <div class="payment-instruction">
                    <h4>Instruksi Pembayaran E-Wallet</h4>
                    <p><strong>GCash Number:</strong> 09XX-XXX-XXXX</p>
                    <p><strong>Dana ID:</strong> @uniskalabkomputer</p>
                    <p><strong>Jumlah:</strong> Rp ${paymentData.price.toLocaleString('id-ID')}</p>
                    <p style="color: #e74c3c; margin-top: 10px;"><strong>* Kirim bukti pembayaran ke WhatsApp: 081234567890</strong></p>
                </div>
            `;
            break;
        case 'card':
            accountInfo = `
                <div class="payment-instruction">
                    <h4>Pembayaran Kartu Kredit/Debit</h4>
                    <p><strong>Jumlah:</strong> Rp ${paymentData.price.toLocaleString('id-ID')}</p>
                    <p style="margin-top: 15px;">Sistem akan mengarahkan Anda ke gateway pembayaran aman untuk melengkapi transaksi.</p>
                    <button type="button" class="btn-main full-width" onclick="simulateCardPayment('${paymentData.npm}')" style="margin-top: 15px;">Lanjut ke Payment Gateway</button>
                </div>
            `;
            break;
        case 'cash':
            accountInfo = `
                <div class="payment-instruction">
                    <h4>Pembayaran Tunai</h4>
                    <p><strong>Lokasi:</strong> Lab Komputer UNISKA Gedung D Lantai 2</p>
                    <p><strong>Jumlah:</strong> Rp ${paymentData.price.toLocaleString('id-ID')}</p>
                    <p><strong>Jam Operasional:</strong> Senin - Jumat 08:00 - 16:00</p>
                    <p style="color: #e74c3c; margin-top: 10px;"><strong>* Tunjukkan email konfirmasi ini saat membayar</strong></p>
                </div>
            `;
            break;
    }

    // Buat notifikasi pembayaran
    const confirmationHTML = `
        <div class="payment-confirmation">
            <div class="confirmation-header">
                <div class="confirmation-icon">✓</div>
                <h3>Ringkasan Pembayaran</h3>
            </div>
            
            <div class="confirmation-details">
                <p><strong>Nama:</strong> ${paymentData.nama}</p>
                <p><strong>NPM:</strong> ${paymentData.npm}</p>
                <p><strong>Program:</strong> ${paymentData.program}</p>
                <p><strong>Paket:</strong> ${selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)}</p>
                <p><strong>Harga:</strong> Rp ${paymentData.price.toLocaleString('id-ID')}</p>
                <p><strong>Metode:</strong> ${getPaymentMethodLabel(paymentData.method)}</p>
            </div>

            ${accountInfo}

            <div class="confirmation-footer">
                <p style="font-size: 0.9em; color: #7f8c8d; margin-top: 20px;">ID Transaksi: TRX${Date.now()}</p>
                <p style="font-size: 0.9em; color: #7f8c8d;">Waktu: ${paymentData.timestamp}</p>
            </div>

            <button type="button" class="btn-main full-width" onclick="finishPayment()" style="margin-top: 20px;">Selesai</button>
        </div>
    `;

    // Buat modal baru untuk konfirmasi
    const confirmModal = document.createElement('div');
    confirmModal.id = 'modalConfirmation';
    confirmModal.className = 'modal';
    confirmModal.style.display = 'block';
    confirmModal.innerHTML = `
        <div class="modal-content modal-large">
            <span class="close" onclick="closeModal('modalConfirmation')">&times;</span>
            ${confirmationHTML}
        </div>
    `;

    // Hapus modal lama jika ada
    const oldModal = document.getElementById('modalConfirmation');
    if (oldModal) oldModal.remove();

    // Tambah modal baru
    document.body.appendChild(confirmModal);

    // Tutup modal pembayaran
    closeModal('modalPembayaran');

    // Handle click di luar modal
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }
}

function getPaymentMethodLabel(method) {
    const labels = {
        'transfer': 'Transfer Bank',
        'ewallet': 'E-Wallet',
        'card': 'Kartu Kredit/Debit',
        'cash': 'Bayar Tunai'
    };
    return labels[method] || method;
}

function simulateCardPayment(npm) {
    alert(`Mengarahkan ke Payment Gateway untuk NPM: ${npm}\n\nDi lingkungan produksi, ini akan terhubung dengan sistem pembayaran seperti Midtrans, Stripe, atau PayPal.`);
}

function finishPayment() {
    // Reset form
    document.getElementById('formDaftar').reset();
    document.getElementById('namaInput').value = '';
    document.getElementById('npmInput').value = '';
    
    // Hapus semua modal
    closeModal('modalConfirmation');
    
    // Tampilkan pesan sukses
    alert('✓ Pembayaran berhasil diproses!\n\nAnda akan menerima email konfirmasi dan akses materi dalam 1x24 jam.\n\nTerima kasih telah mendaftar di Pelatihan Komputer UNISKA!');
}

function backToRegistration() {
    // Reset payment form
    document.getElementById('formPembayaran').reset();
    selectedPackage = null;
    selectedPrice = 0;
    
    // Reset package card
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Tutup modal pembayaran dan buka modal registrasi
    closeModal('modalPembayaran');
    openModal('modalDaftar');
}

