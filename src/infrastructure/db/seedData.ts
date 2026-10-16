import { CopyStatus, UserRole, UserType } from '../../core/types/enums';

export interface SeedUser {
  id: string;
  student_or_staff_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  user_type: UserType;
  max_borrow_limit: number;
}

export interface SeedCategory {
  id: number;
  name: string;
  shelf_prefix: string;
}

export interface SeedAuthor {
  id: number;
  full_name: string;
  biography: string;
}

export interface SeedBook {
  id: string;
  isbn: string;
  title: string;
  category_id: number;
  publisher: string;
  publish_year: number;
  page_count: number;
  description: string;
  author_ids: number[];
}

export interface SeedCopy {
  id: string;
  book_id: string;
  barcode: string;
  shelf_location: string;
  status: CopyStatus;
  condition_notes: string;
}

export const SEED_DATA = {
  users: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      student_or_staff_id: '2024001',
      full_name: 'Ali Yılmaz',
      email: 'ali.yilmaz@ogrenci.edu.tr',
      role: UserRole.MEMBER,
      user_type: UserType.STUDENT,
      max_borrow_limit: 3,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      student_or_staff_id: 'AKAD-102',
      full_name: 'Doç. Dr. Ayşe Demir',
      email: 'ayse.demir@universite.edu.tr',
      role: UserRole.MEMBER,
      user_type: UserType.ACADEMIC,
      max_borrow_limit: 7,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      student_or_staff_id: 'STD-505',
      full_name: 'Mehmet Kaya',
      email: 'mehmet.kaya@kamu.gov.tr',
      role: UserRole.MEMBER,
      user_type: UserType.STANDARD,
      max_borrow_limit: 2,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      student_or_staff_id: 'LIB-001',
      full_name: 'Zeynep Kütüphaneci',
      email: 'zeynep@kutuphane.edu.tr',
      role: UserRole.LIBRARIAN,
      user_type: UserType.STANDARD,
      max_borrow_limit: 5,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000005',
      student_or_staff_id: '2024002',
      full_name: 'Burak Kaya',
      email: 'burak.kaya@ogrenci.edu.tr',
      role: UserRole.MEMBER,
      user_type: UserType.STUDENT,
      max_borrow_limit: 3,
    },
    {
      id: 'a0000000-0000-0000-0000-000000000006',
      student_or_staff_id: 'AKAD-105',
      full_name: 'Prof. Dr. Emre Koç',
      email: 'emre.koc@universite.edu.tr',
      role: UserRole.MEMBER,
      user_type: UserType.ACADEMIC,
      max_borrow_limit: 7,
    },
  ],
  categories: [
    { id: 1, name: 'Yazılım & Bilgisayar Bilimleri', shelf_prefix: 'CS' },
    { id: 2, name: 'Dünya Edebiyatı & Klasikler', shelf_prefix: 'LIT' },
    { id: 3, name: 'Felsefe & Düşünce', shelf_prefix: 'PHI' },
    { id: 4, name: 'Bilim & Popüler Matematik', shelf_prefix: 'SCI' },
  ],
  authors: [
    { id: 1, full_name: 'Robert C. Martin', biography: 'Uncle Bob olarak bilinen yazılım mimarı ve yazar.' },
    { id: 2, full_name: 'Martin Fowler', biography: 'Yazılım tasarımı, yeniden düzenleme ve mimari uzmanı.' },
    { id: 3, full_name: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', biography: 'Gang of Four (GoF) - Tasarım Desenleri mimarları.' },
    { id: 4, full_name: 'Fyodor Dostoyevski', biography: 'Rus edebiyatının en büyük psikolojik realizm ustası.' },
    { id: 5, full_name: 'George Orwell', biography: 'Distopik ve politik kurgunun öncüsü İngiliz yazar.' },
    { id: 6, full_name: 'Marcus Aurelius', biography: 'Roma İmparatoru ve Stoacı filozof.' },
    { id: 7, full_name: 'Andrew Hunt & David Thomas', biography: 'The Pragmatic Programmer yazarları.' },
  ],
  books: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      isbn: '978-0132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      category_id: 1,
      publisher: 'Prentice Hall',
      publish_year: 2008,
      page_count: 464,
      description: 'Yazılım geliştiriciler için okunabilir, sürdürülebilir ve temiz kod yazma ilkeleri.',
      author_ids: [1],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      isbn: '978-0201485677',
      title: 'Refactoring: Improving the Design of Existing Code',
      category_id: 1,
      publisher: 'Addison-Wesley',
      publish_year: 2018,
      page_count: 448,
      description: 'Mevcut kodun tasarımını güvenle iyileştirme rehberi.',
      author_ids: [2],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      isbn: '978-0201633610',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      category_id: 1,
      publisher: 'Addison-Wesley',
      publish_year: 1994,
      page_count: 395,
      description: 'Yazılım mimarisi ve nesne yönelimli tasarımın 23 temel deseni (GoF).',
      author_ids: [3],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      isbn: '978-0135957059',
      title: 'The Pragmatic Programmer: 20th Anniversary Edition',
      category_id: 1,
      publisher: 'Addison-Wesley',
      publish_year: 2019,
      page_count: 352,
      description: 'Usta bir yazılımcı olmak için pratik felsefe ve alışkanlıklar.',
      author_ids: [7],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      isbn: '978-9750738600',
      title: 'Suç ve Ceza',
      category_id: 2,
      publisher: 'Can Yayınları',
      publish_year: 2019,
      page_count: 688,
      description: 'Raskolnikov ve vicdan muhasebesi üzerine unutulmaz psikolojik başyapıt.',
      author_ids: [4],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000006',
      isbn: '978-9750718534',
      title: '1984',
      category_id: 2,
      publisher: 'Can Yayınları',
      publish_year: 2020,
      page_count: 352,
      description: 'Büyük Birader gözetimindeki totaliter distopya klasiği.',
      author_ids: [5],
    },
    {
      id: 'b0000000-0000-0000-0000-000000000007',
      isbn: '978-6052953266',
      title: 'Kendime Düşünceler',
      category_id: 3,
      publisher: 'Türkiye İş Bankası Kültür Yayınları',
      publish_year: 2018,
      page_count: 176,
      description: 'Stoacı felsefenin imparator Marcus Aurelius tarafından kaleme alınan içsel notları.',
      author_ids: [6],
    },
  ],
  copies: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      book_id: 'b0000000-0000-0000-0000-000000000001',
      barcode: 'BC-CS-001',
      shelf_location: 'CS-A-12',
      status: CopyStatus.BORROWED,
      condition_notes: 'Ali Yılmaz ödünç aldı (Gecikmede).',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      book_id: 'b0000000-0000-0000-0000-000000000001',
      barcode: 'BC-CS-002',
      shelf_location: 'CS-A-12',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Rafta, temiz durumda.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      book_id: 'b0000000-0000-0000-0000-000000000002',
      barcode: 'BC-CS-003',
      shelf_location: 'CS-B-04',
      status: CopyStatus.BORROWED,
      condition_notes: 'Ayşe Demir ödünç aldı (Aktif zamanında).',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      book_id: 'b0000000-0000-0000-0000-000000000002',
      barcode: 'BC-CS-004',
      shelf_location: 'CS-B-04',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Rafta, ödünç verilebilir.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000005',
      book_id: 'b0000000-0000-0000-0000-000000000003',
      barcode: 'BC-CS-005',
      shelf_location: 'CS-B-09',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Mükemmel kondisyonda.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000006',
      book_id: 'b0000000-0000-0000-0000-000000000003',
      barcode: 'BC-CS-006',
      shelf_location: 'CS-B-09',
      status: CopyStatus.MAINTENANCE,
      condition_notes: 'Cilt tamiri için bakıma gönderildi.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000007',
      book_id: 'b0000000-0000-0000-0000-000000000004',
      barcode: 'BC-CS-007',
      shelf_location: 'CS-C-01',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Yeni baskı rafta.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000008',
      book_id: 'b0000000-0000-0000-0000-000000000005',
      barcode: 'BC-LIT-001',
      shelf_location: 'LIT-A-03',
      status: CopyStatus.BORROWED,
      condition_notes: 'Mehmet Kaya ödünç aldı.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000009',
      book_id: 'b0000000-0000-0000-0000-000000000005',
      barcode: 'BC-LIT-002',
      shelf_location: 'LIT-A-03',
      status: CopyStatus.RESERVED,
      condition_notes: 'Sıradaki üye için ayrıldı (Observer testi).',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000010',
      book_id: 'b0000000-0000-0000-0000-000000000006',
      barcode: 'BC-LIT-003',
      shelf_location: 'LIT-B-11',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Rafta.',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000011',
      book_id: 'b0000000-0000-0000-0000-000000000007',
      barcode: 'BC-PHI-001',
      shelf_location: 'PHI-A-01',
      status: CopyStatus.AVAILABLE,
      condition_notes: 'Rafta.',
    },
  ],
};
