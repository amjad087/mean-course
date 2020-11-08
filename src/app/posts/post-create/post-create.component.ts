import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { PostsService } from './../posts.service';
import { Post } from './../post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  form: FormGroup;
  mode = 'create';
  private postId: string;
  post: Post;
  imagePreview: string;
  progress = 0;
  constructor(private postsService: PostsService, public route: ActivatedRoute) {}

  ngOnInit() {

    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paraMap.get('postId');
        this.postsService.getPost(this.postId)
        .pipe(
          map(resData => {
            return {
              id: resData._id,
              title: resData.title,
              content: resData.content,
              imagePath: resData.imagePath,
              creator: resData.userId

            };
          })
        )
        .subscribe(transformedPost => {
          this.imagePreview = transformedPost.imagePath;
          this.post = transformedPost;
          this.form.setValue({
            title: transformedPost.title,
            content: transformedPost.content,
            image: transformedPost.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
        this.post = null;
      }
    });
  }

  onImageChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      image: file
    });
    this.form.get('image').updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.onprogress = (data) => {
      if (data.lengthComputable) {
        this.progress = (data.loaded / data.total) * 100 ;
        console.log(this.progress);
      }
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {

    if (this.form.invalid) {
      return;
    }

    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.editPost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

}
