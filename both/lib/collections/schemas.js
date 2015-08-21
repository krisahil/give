Books.attachSchema(new SimpleSchema({
  "trashmountain.title":          {
      type:  String,
      label: "Title",
      max:   200
    },
  "trashmountain.author":         {
      type:  String,
      label: "Author"
    },
  "trashmountain.copies":         {
        type:  Number,
        label: "Number of copies",
        min:   0
      },
  "trashmountain.lastCheckedOut": {
        type:     Date,
        label:    "Last date this book was checked out",
        optional: true
      },
  "trashmountain.summary":        {
      type:     String,
      label:    "Brief summary",
      optional: true,
      max:      1000
    }
}));
