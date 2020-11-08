import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + 'posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  postsUpdated = new Subject<{posts: Post[], postsCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currPage}`;
    this.http.get<{message: string, posts: any, totalPosts: number}>(BACKEND_URL + queryParams)
    .pipe(
      map(postData => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          postsCount: postData.totalPosts
        };
      })
    )
    .subscribe((transformedPosts) => {
      this.posts = transformedPosts.posts;
      this.postsUpdated.next({posts: [...this.posts], postsCount: transformedPosts.postsCount});
    });
  }

  getPost(postId: string) {
    // return { ...this.posts.find(p => p.id === postId )};
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, userId: string}>(
      BACKEND_URL + postId
    ); // returns observable (not subcribed here and will subscribe in the component)
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    // const post: Post = {id: null, title, content};
    this.http.post<{message: string, createdPost: any}>(BACKEND_URL, postData)
    .pipe(
      map(resData => {
        return {
          title: resData.createdPost.title,
          content: resData.createdPost.content,
          id: resData.createdPost._id,
          imagePath: resData.createdPost.imagePath,
          creator: resData.createdPost.creator
        };
      })
    )
    .subscribe(newPost => {
      this.router.navigate(['/']);
    });
  }

  editPost(postId: string, title: string, content: string, image: File | string) {
    let postData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: postId,
        title,
        content,
        imagePath: image
      };
    }
    this.http.put<{message: string}>(BACKEND_URL + postId, postData)
    .subscribe(resData => {
      console.log(resData.message);
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + postId);
  }
}
