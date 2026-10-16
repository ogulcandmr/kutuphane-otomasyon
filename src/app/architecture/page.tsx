'use client';

import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const PLANTUML_CLASS_DIAGRAM = `@startuml
skinparam classAttributeIconSize 0

abstract class User {
  - id: UUID
  - studentOrStaffId: String
  - fullName: String
  - email: String
  - role: UserRole
  - maxBorrowLimit: int
  + canBorrow(currentLoanCount: int): boolean
}

class StudentUser extends User {
  + getFineStrategy(): IFineStrategy
}

class AcademicUser extends User {
  + getFineStrategy(): IFineStrategy
}

class Book {
  - id: UUID
  - isbn: String
  - title: String
  - publisher: String
  - publishYear: int
  - copies: List<BookCopy>
}

class BookCopy {
  - id: UUID
  - barcode: String
  - shelfLocation: String
  - state: IBookCopyState
  + setState(state: IBookCopyState): void
  + borrow(): void
  + returnCopy(): void
}

class Loan {
  - id: UUID
  - userId: UUID
  - bookCopyId: UUID
  - loanDate: DateTime
  - dueDate: DateTime
  - returnDate: DateTime
  + isOverdue(): boolean
  + getOverdueDays(): int
}

class Fine {
  - id: UUID
  - loanId: UUID
  - amount: double
  - isPaid: boolean
}

interface IBookCopyState {
  + borrow(copy: BookCopy): void
  + returnCopy(copy: BookCopy): void
  + reserve(copy: BookCopy): void
}

class AvailableState implements IBookCopyState
class BorrowedState implements IBookCopyState
class ReservedState implements IBookCopyState
class MaintenanceState implements IBookCopyState

BookCopy o-- IBookCopyState
Book *-- BookCopy

interface IFineStrategy {
  + calculateFine(days: int): double
}

class StudentFineStrategy implements IFineStrategy {
  + calculateFine(days: int): double
}

class AcademicFineStrategy implements IFineStrategy {
  + calculateFine(days: int): double
}

interface IObserver {
  + update(bookId: UUID): void
}

interface ISubject {
  + attach(observer: IObserver): void
  + notify(bookId: UUID): void
}

class CirculationDesk implements ISubject
class ReservationNotifier implements IObserver

CirculationDesk o-- IObserver

interface IBookRepository
interface ILoanRepository

class CirculationService {
  - bookRepo: IBookRepository
  - loanRepo: ILoanRepository
  + borrowBook(userId: UUID, barcode: String): Loan
  + returnBook(barcode: String): Fine
}

CirculationService --> User
CirculationService --> BookCopy
CirculationService --> Loan
CirculationService --> IFineStrategy
@enduml`;

const PLANTUML_OBJECT_DIAGRAM = `@startuml
object "studentAli : StudentUser" as userAli {
  id = "usr-101"
  studentOrStaffId = "2024001"
  fullName = "Ali Yılmaz"
  role = "MEMBER"
  maxBorrowLimit = 3
}

object "refCleanCode : Book" as bookCleanCode {
  id = "bk-500"
  isbn = "978-0132350884"
  title = "Clean Code"
  publisher = "Prentice Hall"
}

object "copy1 : BookCopy" as copyCleanCode {
  id = "cp-901"
  barcode = "BC-2024-001"
  shelfLocation = "A-12"
}

object "currentState : BorrowedState" as stateBorrowed

object "activeLoan : Loan" as loan1 {
  id = "ln-301"
  userId = "usr-101"
  bookCopyId = "cp-901"
  loanDate = "2024-10-01"
  dueDate = "2024-10-16"
  status = "OVERDUE"
}

object "appliedStrategy : StudentFineStrategy" as stratStudent {
  dailyRate = 5.0
}

object "overdueFine : Fine" as fineAli {
  id = "fn-701"
  loanId = "ln-301"
  amount = 15.00
  isPaid = false
}

userAli "1" -- "0..*" loan1 : borrows
loan1 "1" -- "1" copyCleanCode : concerns
bookCleanCode "1" *-- "1..*" copyCleanCode : contains
copyCleanCode "1" o-- "1" stateBorrowed : current state
loan1 "1" ..> "1" stratStudent : calculated by
loan1 "1" -- "0..1" fineAli : incurs
@enduml`;

const PLANTUML_DEPLOYMENT_DIAGRAM = `@startuml
node "Client Device (macOS / Browser)" <<device>> {
  artifact "Next.js UI Application\\n(React, Tailwind)" as ClientApp
}

node "Application Server (Node.js Runtime)" <<execution environment>> {
  component "Next.js Web Server\\n(Server Actions & API Routes)" as WebServer
  component "Circulation & Core Domain Services" as DomainServices
}

node "Database Server (Supabase Cloud / PostgreSQL)" <<device>> {
  database "PostgreSQL Relational DB" as PostgresDB {
    frame "Schema: Public" {
      [books]
      [book_copies]
      [loans]
      [users]
      [fines]
      [reservations]
    }
  }
}

ClientApp -- WebServer : "HTTPS / JSON (Port 443 / 3000)"
WebServer -- DomainServices : "In-Memory Function Calls"
DomainServices -- PostgresDB : "TCP / SQL Connection (Supabase API / Port 5432)"
@enduml`;

export default function ArchitecturePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Başlık */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            A3 Kağıdı Çizim & Sunum Referansı
          </span>
          <span className="text-xs text-slate-400">Yazılım Tasarımı ve Mimarisi Dersi</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-400" />
          <span>Sistem Mimarisi, Tasarım Desenleri ve UML Şartnamesi</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
          Bu sayfada teslim aşamasında A3 kağıdına çizilecek Class, Object ve Deployment diyagramlarının PlantUML kodları ve sistemde çalışan 4 temel tasarım deseninin kod tabanındaki haritası yer almaktadır.
        </p>
      </div>

      {/* 4 Temel Tasarım Deseni Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
            <GitBranch className="w-4 h-4" />
            <span>State Pattern</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">BookCopy</strong> nesnesinin durumları (Available, Borrowed, Reserved, Maintenance) spagetti if-else yerine nesne polimorfizmiyle yönetilir.
          </p>
          <code className="text-[10px] text-slate-500 font-mono mt-3 block">
            src/core/patterns/state/
          </code>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Strategy Pattern</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dinamik ceza hesabı üyelik tipine göre (Öğrenci 5₺, Akademisyen 2₺, Standart 10₺) OCP ilkesine uygun olarak <strong className="text-white">IFineStrategy</strong> üzerinden işletilir.
          </p>
          <code className="text-[10px] text-slate-500 font-mono mt-3 block">
            src/core/patterns/strategy/
          </code>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
            <Share2 className="w-4 h-4" />
            <span>Observer Pattern</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kitap iade edildiğinde <strong className="text-white">CirculationDesk</strong> olayı yayınlar; <strong className="text-white">ReservationNotifier</strong> bekleyen üyeyi tespit edip kopyayı rezerve eder.
          </p>
          <code className="text-[10px] text-slate-500 font-mono mt-3 block">
            src/core/patterns/observer/
          </code>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm mb-2">
            <Network className="w-4 h-4" />
            <span>Repository & UoW</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Domain katmanı Supabase / PostgreSQL veri tabanından tamamen soyutlanmıştır. CRUD ve işlemler <strong className="text-white">UnitOfWork</strong> sınırında toplanır.
          </p>
          <code className="text-[10px] text-slate-500 font-mono mt-3 block">
            src/infrastructure/repositories/
          </code>
        </div>
      </div>

      {/* A3 Diyagram 1: Class Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span>1. Sınıf Diyagramı (Class Diagram - A3 Çizim Modeli)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Domain Entity'leri, State, Strategy ve Observer arayüz bağlantılarını gösteren tam sınıf hiyerarşisi.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(PLANTUML_CLASS_DIAGRAM, 'class')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            {copiedKey === 'class' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'class' ? 'Kopyalandı' : 'PlantUML Kopyala'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-80">
          {PLANTUML_CLASS_DIAGRAM}
        </pre>
      </div>

      {/* A3 Diyagram 2: Object Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>2. Nesne Diyagramı (Object Diagram - Runtime Snapshot)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Öğrenci Ali Yılmaz'ın gecikmiş Clean Code ödünç kaydı ve StudentFineStrategy ile hesaplanan somut nesne anlık görüntüsü.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(PLANTUML_OBJECT_DIAGRAM, 'object')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            {copiedKey === 'object' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'object' ? 'Kopyalandı' : 'PlantUML Kopyala'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-80">
          {PLANTUML_OBJECT_DIAGRAM}
        </pre>
      </div>

      {/* A3 Diyagram 3: Deployment Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              <span>3. Dağıtım Diyagramı (Deployment Diagram)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Client Browser, Node.js Next.js Server Actions ve Supabase PostgreSQL Veritabanı fiziksel düğüm ilişkileri.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(PLANTUML_DEPLOYMENT_DIAGRAM, 'deployment')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            {copiedKey === 'deployment' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'deployment' ? 'Kopyalandı' : 'PlantUML Kopyala'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-80">
          {PLANTUML_DEPLOYMENT_DIAGRAM}
        </pre>
      </div>
    </div>
  );
}
