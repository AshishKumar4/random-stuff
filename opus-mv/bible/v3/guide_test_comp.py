import sys; sys.path.insert(0, '/home/user/random-stuff/opus-mv/tools')
from musiclib import Song

CH = ("A4/.5 A4/.5 C5/.5 F5/1.5 E5/.5 D5/.5 E5/1 D5/.5 C5/.5 B4/1.5 _/.5 "
      "G4/.5 B4/1 B4/.5 C5/.5 E5/1 D5/.5 C5/1 B4/.5 A4/2.5 "
      "_/.5 A4/.5 C5/.5 F5/1.5 E5/.5 D5/.5 E5/1 D5/.5 C5/.5 D5/.5 E5/1.5 "
      "_/.5 G4/.5 B4/.5 E5/1.5 D5/.5 C5/.5 E5/1 D5/.5 C5/.5 B4/.5 A4/1.5")
CH_LYR = ("Ev-ery-one's scared of the end of the world I do it a mil-lion times a day "
          "It's the start of the world when you say hi It's the end of the world when you say bye")
LEAD = CH.replace('_/', '_/')


def build():
    s = Song(bpm=128, key='A minor', title='v3 guide test')
    s.section('Chorus', bars=8, energy=8)
    s.section('Drop', bars=8, energy=9)
    for sec in ('Chorus', 'Drop'):
        s.chords(sec, 'F | G | Em | Am | F | G | Em | Am', inst='warm_pad', bass_track='bass',
                 bass_rhythm=[(0, .5), (1, .5), (2, .5), (3, .5)])
        s.drums(sec, {'kick': 'x...x...x...x...', 'clap': '....x.......x...', 'hat': '..x...x...x...x.'})
    s.melody('Chorus', CH, lyric=CH_LYR)
    s.line('Drop', CH, track='lead', inst='lead_saw')
    # the chant, sung by the guide on the drop's first four bars
    s.melody('Drop', "_/.5 E5/.5 E5/.5 G5/1 E5/1.5 A4/1 _/3 _/.5 E5/.5 E5/.5 A5/2.5 E5/1 _/3",
             lyric="It's so o-ver bye We're so back hi")
    return s
