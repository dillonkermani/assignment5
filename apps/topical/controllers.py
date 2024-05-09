from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from .models import get_user_email

# Home page action
@action('index')
@action.uses('index.html', db, auth.user)
def index():
    return dict(
        post_url=URL('create_post'),
        posts_url=URL('get_posts'),
        delete_post_url=URL('delete_post'),
        tags_url=URL('get_tags'),
        toggle_tag_url=URL('toggle_tag')
    )

# Fetch posts
@action('get_posts')
@action.uses(db, auth.user)
def get_posts():
    posts = db(db.post.user_id == auth.current_user.get('id')).select(orderby=~db.post.created_at)
    return dict(posts=posts.as_list())

# Create a new post
@action('create_post', method="POST")
@action.uses(db, auth.user, session)
def create_post():
    text = request.json.get('text')
    tags = set(request.json.get('tags', []))
    post_id = db.post.insert(text=text, user_id=auth.current_user.get('id'))
    
    # Handle tags
    for tag in tags:
        tag_record = db.tag(name=tag) or db.tag.insert(name=tag)
        db.post_tags.insert(post_id=post_id, tag_id=tag_record.id)
    
    return redirect(URL('index'))

# Delete a post
@action('delete_post', method="POST")
@action.uses(db, auth.user, session)
def delete_post():
    post_id = request.json.get('post_id')
    post = db.post(post_id)
    if not post or post.user_id != auth.current_user.get('id'):
        abort(403)  # Unauthorized
    db(db.post.id == post_id).delete()
    return "ok"

# Fetch tags
@action('get_tags')
@action.uses(db, auth.user)
def get_tags():
    tags = db().select(db.tag.ALL)
    return dict(tags=tags.as_list())

# Toggle tag visibility (for filtering)
@action('toggle_tag', method="POST")
@action.uses(db, auth.user)
def toggle_tag():
    tag_id = request.json.get('tag_id')
    tag = db.tag(tag_id)
    if not tag:
        abort(404)  # Tag not found
    # Implement tag toggling logic, potentially using session or another mechanism to track active/inactive tags
    return "ok"
