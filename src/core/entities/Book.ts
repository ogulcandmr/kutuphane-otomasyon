import { BookCopy } from './BookCopy';
import { CopyStatus } from '../types/enums';

export interface IAuthor {
  id: number;
  fullName: string;
  biography?: string;
}

export interface ICategory {
  id: number;
  name: string;
  shelfPrefix: string;
}

export interface IBookProps {
  id: string;
  isbn: string;
  title: string;
  categoryId?: number;
  categoryName?: string;
  publisher: string;
  publishYear: number;
  pageCount: number;
  description?: string;
  authors?: IAuthor[];
  copies?: BookCopy[];
  createdAt?: Date;
}

export class Book {
  public readonly id: string;
  public readonly isbn: string;
  public readonly title: string;
  public categoryId?: number;
  public categoryName?: string;
  public readonly publisher: string;
  public readonly publishYear: number;
  public readonly pageCount: number;
  public readonly description?: string;
  public authors: IAuthor[];
  public copies: BookCopy[];
  public readonly createdAt: Date;

  constructor(props: IBookProps) {
    this.id = props.id;
    this.isbn = props.isbn;
    this.title = props.title;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName;
    this.publisher = props.publisher;
    this.publishYear = props.publishYear;
    this.pageCount = props.pageCount;
    this.description = props.description;
    this.authors = props.authors ?? [];
    this.copies = props.copies ?? [];
    this.createdAt = props.createdAt ?? new Date();
  }

  public getAvailableCopyCount(): number {
    return this.copies.filter((copy) => copy.status === CopyStatus.AVAILABLE).length;
  }

  public getTotalCopyCount(): number {
    return this.copies.length;
  }

  public getFirstAvailableCopy(): BookCopy | undefined {
    return this.copies.find((copy) => copy.status === CopyStatus.AVAILABLE);
  }

  public getAuthorsString(): string {
    if (this.authors.length === 0) return 'Bilinmiyor';
    return this.authors.map((a) => a.fullName).join(', ');
  }
}
