import { PageEvent } from '@angular/material/paginator';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { PostsService } from './../posts.service';
import { Post } from './../post.model';
import { AuthService } from './../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  userId: string;
  loading = false;
  posts: Post[] = [];
  totalPosts = 0;
  postsPerPage = 2;
  currPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private postsSub: Subscription;
  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loading = true;
    this.postsService.getPosts(this.postsPerPage, this.currPage);
    this.postsSub = this.postsService.postsUpdated
    .subscribe((postData: {posts: Post[], postsCount: number}) => {
      this.userId = this.authService.getUserId();
      this.loading = false;
      this.posts = postData.posts;
      this.totalPosts = postData.postsCount;
    });
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId)
    .subscribe(() => {
      this.loading = true;
      this.postsService.getPosts(this.postsPerPage, this.currPage);
    });
  }

  onPageChanged(pageData: PageEvent) {
    this.loading = true;
    this.postsPerPage = pageData.pageSize;
    this.currPage = pageData.pageIndex + 1;
    this.postsService.getPosts(this.postsPerPage, this.currPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  isUserAuthenticated() {
    return this.authService.isUserAuthenticated();
  }

}
