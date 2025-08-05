import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Image, ImageStats, ApiResponse, PaginatedResponse } from '../models/image';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      }
    }
    console.error('ImageService Error:', error);
    return throwError(() => errorMessage);
  }

  // Test backend connectivity
  testConnection(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Upload single image
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/images/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  // Upload multiple images
  uploadMultipleImages(files: FileList): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    return this.http.post(`${this.apiUrl}/images/upload-multiple`, formData)
      .pipe(catchError(this.handleError));
  }

  // Get all images with pagination
  getAllImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images?page=${page}&size=${size}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get image thumbnail URL
  getImageThumbnail(id: number, width = 150, height = 150): string {
    return `${this.apiUrl}/images/${id}/thumbnail?width=${width}&height=${height}`;
  }

  // Download image
  downloadImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/images/${id}/download`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  // Toggle favorite status
  toggleFavorite(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/favorite`, {})
      .pipe(catchError(this.handleError));
  }

  // Toggle archive status
  toggleArchive(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  // Move to trash (soft delete)
  moveToTrash(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/trash`, {})
      .pipe(catchError(this.handleError));
  }

  // Permanent delete
  deleteImage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Restore from trash
  restoreFromTrash(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/restore`, {})
      .pipe(catchError(this.handleError));
  }

  // Get image statistics
  getStats(): Observable<ImageStats> {
    return this.http.get<ApiResponse<ImageStats>>(`${this.apiUrl}/images/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Search images
  searchImages(query: string, page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get favorite images
  getFavoriteImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/favorites?page=${page}&size=${size}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get archived images
  getArchivedImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/archived?page=${page}&size=${size}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get trashed images
  getTrashedImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/trash?page=${page}&size=${size}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
