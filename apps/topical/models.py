"""
This file defines the database models
"""
import datetime
import re

from .common import db, Field, auth
from pydal.validators import *

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_user():
    return auth.current_user.get('id') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()

# Complete. 
def parse_post_content(content):
    return re.sub(r'\s+', ' ', content).strip()

# Assuming the db object is already created and configured appropriately elsewhere in your code

db.define_table(
    'user',
    Field('email', unique=True),
    Field('password', 'password'),
    Field('first_name'),
    Field('last_name')
)

db.define_table(
    'post',
    Field('user_id', 'reference user'),
    Field('text', 'text'),
    Field('created_at', 'datetime', default=lambda: datetime.datetime.utcnow()),
)

db.define_table(
    'tag',
    Field('name', unique=True)
)

db.define_table(
    'post_tags',
    Field('post_id', 'reference post'),
    Field('tag_id', 'reference tag')
)

db.define_table(
    'session',
    Field('user_id', 'reference user'),
    Field('session_token'),
    Field('created_at', 'datetime', default=lambda: datetime.datetime.utcnow()),
)

db.commit()

