-- ====================================================================
-- KÜTÜPHANE YÖNETİM SİSTEMİ - TEST VE DEMO VERİLERİ (SEED DATA)
-- Tüm UUID'ler standart RFC 4122 Hexadecimal (0-9, a-f) uyumludur.
-- ====================================================================

-- 1. KATEGORİLER
INSERT INTO categories (id, name, shelf_prefix) VALUES
(1, 'Yazılım & Bilgisayar Bilimleri', 'CS'),
(2, 'Dünya Edebiyatı & Klasikler', 'LIT'),
(3, 'Felsefe & Düşünce', 'PHI'),
(4, 'Bilim & Popüler Matematik', 'SCI')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, shelf_prefix = EXCLUDED.shelf_prefix;

-- 2. YAZARLAR
INSERT INTO authors (id, full_name, biography) VALUES
(1, 'Robert C. Martin', 'Uncle Bob olarak bilinen dünyaca ünlü yazılım mimarı ve yazar.'),
(2, 'Martin Fowler', 'Yazılım tasarımı, yeniden düzenleme (refactoring) ve mimari uzmanı.'),
(3, 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Gang of Four (GoF) - Tasarım Desenleri mimarları.'),
(4, 'Fyodor Dostoyevski', 'Rus edebiyatının en büyük psikolojik realizm ustası.'),
(5, 'George Orwell', 'Distopik ve politik kurgunun öncüsü İngiliz yazar.'),
(6, 'Marcus Aurelius', 'Roma İmparatoru ve Stoacı filozof.'),
(7, 'Andrew Hunt & David Thomas', 'The Pragmatic Programmer yazarları.')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 3. KULLANICILAR (a000... serisi)
INSERT INTO users (id, student_or_staff_id, full_name, email, role, user_type, max_borrow_limit) VALUES
('a0000000-0000-0000-0000-000000000001', '2024001', 'Ali Yılmaz', 'ali.yilmaz@ogrenci.edu.tr', 'MEMBER', 'STUDENT', 3),
('a0000000-0000-0000-0000-000000000002', 'AKAD-102', 'Doç. Dr. Ayşe Demir', 'ayse.demir@universite.edu.tr', 'MEMBER', 'ACADEMIC', 7),
('a0000000-0000-0000-0000-000000000003', 'STD-505', 'Mehmet Kaya', 'mehmet.kaya@kamu.gov.tr', 'MEMBER', 'STANDARD', 2),
('a0000000-0000-0000-0000-000000000004', 'LIB-001', 'Zeynep Kütüphaneci', 'zeynep@kutuphane.edu.tr', 'LIBRARIAN', 'STANDARD', 5),
('a0000000-0000-0000-0000-000000000005', '2024002', 'Burak Kaya', 'burak.kaya@ogrenci.edu.tr', 'MEMBER', 'STUDENT', 3),
('a0000000-0000-0000-0000-000000000006', 'AKAD-105', 'Prof. Dr. Emre Koç', 'emre.koc@universite.edu.tr', 'MEMBER', 'ACADEMIC', 7)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, user_type = EXCLUDED.user_type;

-- 4. KİTAPLAR (b000... serisi)
INSERT INTO books (id, isbn, title, category_id, publisher, publish_year, page_count, description) VALUES
('b0000000-0000-0000-0000-000000000001', '978-0132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 1, 'Prentice Hall', 2008, 464, 'Yazılım geliştiriciler için okunabilir, sürdürülebilir ve temiz kod yazma ilkeleri.'),
('b0000000-0000-0000-0000-000000000002', '978-0201485677', 'Refactoring: Improving the Design of Existing Code', 1, 'Addison-Wesley', 2018, 448, 'Mevcut kodun iç yapısını davranışını değiştirmeden iyileştirme sanatı.'),
('b0000000-0000-0000-0000-000000000003', '978-0201633610', 'Design Patterns: Elements of Reusable Object-Oriented Software', 1, 'Addison-Wesley', 1994, 395, 'Yazılım mimarisi ve nesne yönelimli tasarımın 23 temel deseni (GoF).'),
('b0000000-0000-0000-0000-000000000004', '978-0135957059', 'The Pragmatic Programmer: 20th Anniversary Edition', 1, 'Addison-Wesley', 2019, 352, 'Usta bir yazılımcı olmak için pratik felsefe ve alışkanlıklar.'),
('b0000000-0000-0000-0000-000000000005', '978-9750738600', 'Suç ve Ceza', 2, 'Can Yayınları', 2019, 688, 'Raskolnikov ve vicdan muhasebesi üzerine unutulmaz psikolojik başyapıt.'),
('b0000000-0000-0000-0000-000000000006', '978-9750718534', '1984', 2, 'Can Yayınları', 2020, 352, 'Büyük Birader gözetimindeki totaliter distopya klasiği.'),
('b0000000-0000-0000-0000-000000000007', '978-6052953266', 'Kendime Düşünceler', 3, 'Türkiye İş Bankası Kültür Yayınları', 2018, 176, 'Stoacı felsefenin imparator Marcus Aurelius tarafından kaleme alınan içsel notları.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Kitap-Yazar Eşlemeleri
INSERT INTO book_authors (book_id, author_id) VALUES
('b0000000-0000-0000-0000-000000000001', 1),
('b0000000-0000-0000-0000-000000000002', 2),
('b0000000-0000-0000-0000-000000000003', 3),
('b0000000-0000-0000-0000-000000000004', 7),
('b0000000-0000-0000-0000-000000000005', 4),
('b0000000-0000-0000-0000-000000000006', 5),
('b0000000-0000-0000-0000-000000000007', 6)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- 5. KİTAP KOPYALARI (c000... serisi)
INSERT INTO book_copies (id, book_id, barcode, shelf_location, status, condition_notes) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'BC-CS-001', 'CS-A-12', 'BORROWED', 'Ali Yılmaz ödünç aldı (Gecikmede).'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'BC-CS-002', 'CS-A-12', 'AVAILABLE', 'Rafta, temiz durumda.'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'BC-CS-003', 'CS-B-04', 'BORROWED', 'Ayşe Demir ödünç aldı (Aktif zamanında).'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'BC-CS-004', 'CS-B-04', 'AVAILABLE', 'Rafta, ödünç verilebilir.'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'BC-CS-005', 'CS-B-09', 'AVAILABLE', 'Mükemmel kondisyonda.'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'BC-CS-006', 'CS-B-09', 'MAINTENANCE', 'Cilt tamiri için bakıma gönderildi.'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'BC-CS-007', 'CS-C-01', 'AVAILABLE', 'Yeni baskı rafta.'),
('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000005', 'BC-LIT-001', 'LIT-A-03', 'BORROWED', 'Mehmet Kaya ödünç aldı.'),
('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 'BC-LIT-002', 'LIT-A-03', 'RESERVED', 'Sıradaki üye için ayrıldı (Observer testi).'),
('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006', 'BC-LIT-003', 'LIT-B-11', 'AVAILABLE', 'Rafta.'),
('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000007', 'BC-PHI-001', 'PHI-A-01', 'AVAILABLE', 'Rafta.')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 6. ÖDÜNÇ İŞLEMLERİ (d000... serisi - geçerli hex)
INSERT INTO loans (id, user_id, book_copy_id, loan_date, due_date, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days', 'OVERDUE'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'ACTIVE'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008', NOW() - INTERVAL '3 days', NOW() + INTERVAL '11 days', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 7. GECİKME CEZASI (f000... serisi - Ali Yılmaz için 5 gün * 5 TL = 25 TL)
INSERT INTO fines (id, loan_id, user_id, amount, is_paid, calculated_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 25.00, false, NOW())
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, is_paid = EXCLUDED.is_paid;

-- 8. REZERVASYON KUYRUĞU (e000... serisi - Burak Kaya)
INSERT INTO reservations (id, user_id, book_id, queue_number, is_active) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 1, true)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;
