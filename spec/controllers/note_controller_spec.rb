require "spec_helper"

describe NotesController do
  describe "the create action" do
    before do
      @site = Site.create(:url => "www.google.com")
      @note_count = Note.count
    end

    it "should create a new note" do
      post :create, :note => {:content => Faker::Lorem.paragraph, :site_id => @site.id, :comment => "well this is interesting...", :comment_location_x => "54", :comment_location_y => "89", :client_side_id => "0"}
      Note.count.should == @note_count + 1
      @site.notes.length.should == 1
      Note.last.site.should == @site
    end

    it "should respond with the note content of the note created" do
      note_content = Faker::Lorem.paragraph
      post :create, :note => {:content => note_content, :site_id => @site.id}
      JSON.parse(response.body)["content"].should == note_content
      JSON.parse(response.body)["id"].should == Note.last.id
    end

  end

  describe "the delete action " do
    before do
      site = Site.create()
      @note_count = Note.count
      @note1 = Note.create(:site => site,:content => "hello")
      @note2 = Note.create(:site => site,:content => "hello again")
      @note3 = Note.create(:site => site,:content => "hello again again")
      Note.count.should == @note_count+3
    end

    it "should delete the note with the given id" do
      post :delete, :id => @note3.id
      Note.count.should == @note_count+2
    end

    it "should return the id and content of the previously created note" do
      post :delete, :id => @note3.id
      JSON.parse(response.body)["content"].should == @note2.content
      JSON.parse(response.body)["id"].should == @note2.id
    end
  end
end