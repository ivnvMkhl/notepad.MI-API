const db = require('../db')

class noteService {
  async getAllUserNotes(user_id) {
    try {
      const notes = await db.query(`SELECT * FROM notes WHERE user_id = $1;`, [user_id])
      if (notes.rows.length > 0) {
        let resNotes = []
        for (let i = 0; i < notes.rows.length; i++) {
          resNotes.push({
            noteId: notes.rows[i].note_id,
            noteHeader: notes.rows[i].note_header,
            noteContent: notes.rows[i].note_content,
            noteDate: parseInt(notes.rows[i].note_date),
            noteChange: parseInt(notes.rows[i].note_used),
            noteSelected: notes.rows[i].note_selected,
          })
        }

        return resNotes
      } else return { message: 'no notes' }
    } catch (e) {
      return { message: 'db error' }
    }
  }

  async saveUserNote(user_id, data) {
    const note = await db.query('SELECT note_id FROM notes WHERE note_id = $1 AND user_id = $2;', [data.noteId, user_id])
    if (note.rows.length > 0) {
      db.query('UPDATE notes SET note_header = $1, note_content = $2, note_used = $3, note_selected = false WHERE note_id = $4;', [
        data.noteHeader,
        data.noteContent,
        data.noteChange,
        data.noteId,
      ]).catch((err) => {
        throw Error(err)
      })
      return 'Note save success'
    } else {
      db.query(
        'INSERT INTO notes (note_id, note_header, note_content, note_date, note_used, note_selected, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7);',
        [data.noteId, data.noteHeader, data.noteContent, data.noteDate, data.noteChange, data.noteSelected, user_id]
      ).catch((err) => {
        throw Error(err)
      })
      return 'Note create success'
    }
  }

  async deleteUserNote(user_id, noteId) {
    db.query('DELETE FROM notes WHERE user_id = $1 AND note_id = $2', [user_id, noteId]).catch((err) => {
      throw Error(err)
    })
    return 'Note delete success'
  }
  async deleteAllUserNotes(user_id) {
    db.query('DELETE FROM notes WHERE user_id = $1', [user_id]).catch((err) => {
      throw Error(err)
    })
    return 'Delete all user notes success'
  }
}

module.exports = new noteService()
