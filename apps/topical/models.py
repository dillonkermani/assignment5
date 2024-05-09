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
    'post',
    Field('user_email', default=get_user_email),
    Field('text', 'text'),
    Field('timestamp', 'datetime', default=lambda: datetime.datetime.utcnow()),
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

db.commit()

