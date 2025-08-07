import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Image, ImageStats, ApiResponse, PaginatedResponse } from '../models/image';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getRequestOptions(): { headers: HttpHeaders } {
    return { headers: this.authService.getAuthHeaders() };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    console.error('📛 Full HTTP Error:', error);
    console.error('📛 Error Status:', error.status);
    console.error('📛 Error URL:', error.url);
    console.error('📛 Error Headers:', error.headers);

    if (error.status === 0) {
      // Network error or CORS issue
      errorMessage = 'Network error or CORS issue. Check if backend is running and CORS is configured for file uploads.';
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
      this.authService.logout(); // Clear invalid credentials
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden. You don\'t have permission for this action.';
    } else if (error.status === 413) {
      errorMessage = 'File too large. Please upload a file smaller than 10MB.';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported file type. Please upload a file with a supported type (jpg, png, gif, etc.).';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error. Please try again later.';
    } else if (error.error instanceof Error) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      }
    }

    console.error('📛 Processed Error Message:', errorMessage);
    return throwError(() => errorMessage);
  }

  // Test backend connectivity with auth
  testConnection(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, {
      ...this.getRequestOptions(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  // Upload single image with auth
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // For file uploads, don't set Content-Type header - let browser set it
    const headers = new HttpHeaders({
      'Authorization': this.authService.getAuthHeaders().get('Authorization') || ''
    }); //to remove content type header

    console.log('📤 Uploading file:', file.name, 'Size:', file.size);

    return this.http.post(`${this.apiUrl}/images/upload`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Upload multiple images with auth
  uploadMultipleImages(files: FileList): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const headers = new HttpHeaders({
      'Authorization': this.authService.getAuthHeaders().get('Authorization') || ''
    }); // to remove content type header

    console.log('📤 Uploading multiple files:', files.length);

    return this.http.post(`${this.apiUrl}/images/upload-multiple`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Get all images with auth
  getAllImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images?page=${page}&size=${size}`,
      this.getRequestOptions()
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get image thumbnail URL with auth
  getImageThumbnail(id: number, width = 150, height = 150): string {
    const authHeader = this.authService.getAuthHeaders().get('Authorization');
    return `${this.apiUrl}/images/${id}/thumbnail?width=${width}&height=${height}`;
  }

  // Download image with auth
  downloadImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/images/${id}/download`, {
      ...this.getRequestOptions(),
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  // Toggle favorite with auth
  toggleFavorite(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/favorite`, {}, this.getRequestOptions())
      .pipe(catchError(this.handleError));
  }

  // Toggle archive with auth
  toggleArchive(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/archive`, {}, this.getRequestOptions())
      .pipe(catchError(this.handleError));
  }

  // Move to trash with auth
  moveToTrash(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/images/${id}/trash`, {}, this.getRequestOptions())
      .pipe(catchError(this.handleError));
  }

  // Get favorite images with auth
  getFavoriteImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/favorites?page=${page}&size=${size}`,
      this.getRequestOptions()
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get archived images with auth
  getArchivedImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/archived?page=${page}&size=${size}`,
      this.getRequestOptions()
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get trashed images with auth
  getTrashedImages(page = 0, size = 10): Observable<PaginatedResponse<Image>> {
    return this.http.get<ApiResponse<PaginatedResponse<Image>>>(
      `${this.apiUrl}/images/trash?page=${page}&size=${size}`,
      this.getRequestOptions()
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
